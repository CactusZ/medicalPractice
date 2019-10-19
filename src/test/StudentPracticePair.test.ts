import {
  StudentPracticePair,
  MAX_DISTANCE_SCORE,
  AVERAGE_DISTANCE_OFFSET,
  MATCHING_SPECIALTY_SCORE,
  HAS_CHILD_SCORE
} from "../StudentPracticePair";
import { IStudentPracticePair } from "../typings/IStudentPracticePair";
import db from "../db";
import { getValue } from "../utils/dbHelpers";
import googleClient from "../googleMapsClient";
import { getGoogleDistanceMatrixMock } from "./utils";

const apiResults = [150, 200, 300, 250, 300, 400];
let apiResultIndex = -1;

describe("Student Practice Pair", () => {
  let pair: IStudentPracticePair;

  beforeAll(() => {
    googleClient.distanceMatrix = getGoogleDistanceMatrixMock(() => {
      apiResultIndex = (apiResultIndex + 1) % apiResults.length;
      return apiResults[apiResultIndex];
    });
  });

  beforeEach(() => {
    pair = new StudentPracticePair(
      {
        address: "addr",
        alternativeAddress1: "addrAlt1",
        alternativeAddress2: "addrAlt2",
        favoriteSpecialties: [],
        hasCar: false,
        hasChildren: false,
        id: "S1"
      },
      {
        address: "addr2",
        id: "P1",
        specialties: []
      }
    );
  });

  afterAll(async () => {
    await db.close();
  });

  describe("Pair best duration", () => {
    test("By car", () => {
      pair.travelDurationByCarInSeconds = 60 * 20;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      expect(pair.getFastestTransportDuration()).toBe(60 * 20);
      expect(pair.getFastestTransportMode()).toBe("Car");
    });
    test("By bicycle", () => {
      pair.travelDurationByCarInSeconds = 60 * 40;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      expect(pair.getFastestTransportDuration()).toBe(60 * 30);
      expect(pair.getFastestTransportMode()).toBe("Bicycle");
    });
    test("No car -> By bicycle", () => {
      pair.travelDurationByCarInSeconds = Infinity;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      expect(pair.getFastestTransportDuration()).toBe(60 * 30);
    });
  });

  describe("Pair weight", () => {
    test("No Children, No match, No Average", () => {
      pair.travelDurationByCarInSeconds = 60 * 20;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      const score = MAX_DISTANCE_SCORE - 60 * 20;
      expect(pair.getPairWeight()).toBe(score);
    });
    test("No Children, No match, Has Average", () => {
      pair.travelDurationByCarInSeconds = 60 * 20;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      pair.setAverageDistance(60 * 15);
      const score =
        AVERAGE_DISTANCE_OFFSET * (MAX_DISTANCE_SCORE - 60 * 15) +
        MAX_DISTANCE_SCORE -
        60 * 20;
      expect(pair.getPairWeight()).toBe(score);
    });
    test("No Children, Has match, Has Average", () => {
      pair.travelDurationByCarInSeconds = 60 * 20;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      pair.student.favoriteSpecialties = ["Ab", "Ce"];
      pair.practice.specialties = ["Bc", "Ab"];
      pair.setAverageDistance(60 * 15);
      const score =
        AVERAGE_DISTANCE_OFFSET * (MAX_DISTANCE_SCORE - 60 * 15) +
        (MAX_DISTANCE_SCORE - 60 * 20) +
        MATCHING_SPECIALTY_SCORE;
      expect(pair.getPairWeight()).toBe(score);
    });
    test("Has Children, Has match, No Average", () => {
      pair.travelDurationByCarInSeconds = 60 * 20;
      pair.travelDurationByBicyclingInSeconds = 60 * 30;
      pair.student.favoriteSpecialties = ["Ab", "Ce"];
      pair.practice.specialties = ["Bc", "Ab"];
      pair.student.hasChildren = true;
      const score =
        MAX_DISTANCE_SCORE -
        60 * 20 +
        MATCHING_SPECIALTY_SCORE +
        HAS_CHILD_SCORE;
      expect(pair.getPairWeight()).toBe(score);
    });
  });

  describe("address", () => {
    test("main address", () => {
      expect(pair.getStudentAddress()).toBe("addr");
    });
    test("Alternative address 1", () => {
      pair.isAlternativeAddress1 = true;
      expect(pair.getStudentAddress()).toBe("addrAlt1");
    });
    test("Alternative address 2", () => {
      pair.isAlternativeAddress2 = true;
      expect(pair.getStudentAddress()).toBe("addrAlt2");
    });
  });

  describe("Distance fetching", () => {
    beforeEach(async () => {
      await pair.resetCachedTravelValues();
      pair.student.hasCar = false;
      (googleClient.distanceMatrix as any).mockClear();
    });
    test("Cache empty, no car", async () => {
      expect.assertions(7);
      await pair.fetchTravelDurationsFromCacheOrAPI();
      expect(googleClient.distanceMatrix).toBeCalledTimes(3);
      const bicycling1 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.address, "bicycling")
      );
      expect(apiResults).toContain(bicycling1);
      const bicycling2 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.alternativeAddress1, "bicycling")
      );
      expect(apiResults).toContain(bicycling2);
      const bicycling3 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.alternativeAddress1, "bicycling")
      );
      expect(apiResults).toContain(bicycling3);
      const driving1 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.address, "driving")
      );
      expect(driving1).toBeNull();
      const driving2 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.alternativeAddress1, "driving")
      );
      expect(driving2).toBeNull();
      const driving3 = await getValue<number>(
        db,
        pair.getDbKey(pair.student.alternativeAddress1, "driving")
      );
      expect(driving3).toBeNull();
    });

    test("Cache empty, has car", async () => {
      pair.student.hasCar = true;
      expect.assertions(7);
      await pair.fetchTravelDurationsFromCacheOrAPI();
      expect(googleClient.distanceMatrix).toBeCalledTimes(6);
      expect(apiResults).toContain(
        await getValue(db, pair.getDbKey(pair.student.address, "bicycling"))
      );
      expect(apiResults).toContain(
        await getValue(
          db,
          pair.getDbKey(pair.student.alternativeAddress1, "bicycling")
        )
      );
      expect(apiResults).toContain(
        await getValue(
          db,
          pair.getDbKey(pair.student.alternativeAddress2, "bicycling")
        )
      );
      expect(apiResults).toContain(
        await getValue(db, pair.getDbKey(pair.student.address, "driving"))
      );
      expect(apiResults).toContain(
        await getValue(
          db,
          pair.getDbKey(pair.student.alternativeAddress1, "driving")
        )
      );
      expect(apiResults).toContain(
        await getValue(
          db,
          pair.getDbKey(pair.student.alternativeAddress2, "driving")
        )
      );
    });

    test("0 api calls with cache", async () => {
      pair.student.hasCar = true;
      expect.assertions(2);
      await pair.fetchTravelDurationsFromCacheOrAPI();
      expect(googleClient.distanceMatrix).toBeCalledTimes(6);
      await pair.fetchTravelDurationsFromCacheOrAPI();
      expect(googleClient.distanceMatrix).toBeCalledTimes(6);
    });

    test("Throws error on non number value", async () => {
      expect.assertions(1);
      googleClient.distanceMatrix = getGoogleDistanceMatrixMock(() => {
        return undefined;
      });
      try {
        await pair.fetchTravelDurationsFromCacheOrAPI();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

    })
  });
});
