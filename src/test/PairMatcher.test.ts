import { IStudent } from "../typings/IStudent";
import { IPractice } from "../typings/IPractice";
import { IStudentPracticePair } from "../typings/IStudentPracticePair";
import matchStudentsWithPractices, {
  generateAllPairs,
  fillAverageDistances
} from "../PairMatcher";
import db from "../db";
import googleClient from "../googleMapsClient";
import { getGoogleDistanceMatrixMock } from "./utils";
import { putValue, delValue } from "../utils/dbHelpers";

googleClient.distanceMatrix = getGoogleDistanceMatrixMock(() => {
  return Math.round(Math.random() * 10000);
});
describe("Pair Matcher", () => {
  let pairs: IStudentPracticePair[];
  let students: IStudent[];
  let practices: IPractice[];
  beforeAll(() => {
    students = [
      {
        address: "Riga",
        favoriteSpecialties: ["Software Development"],
        hasCar: false,
        hasChildren: false,
        id: "S001"
      },
      {
        address: "Daugavpils",
        alternativeAddress1: "Cesis",
        favoriteSpecialties: ["Software Development", "Machine Learning"],
        hasCar: true,
        hasChildren: false,
        id: "S002"
      },
      {
        address: "Jurmala",
        favoriteSpecialties: ["Machine Learning"],
        hasCar: true,
        hasChildren: true,
        id: "S003"
      }
    ];
    practices = [
      {
        address: "Ventspils",
        id: "P001",
        specialties: ["Software Development"]
      },
      {
        address: "Liepaja",
        id: "P002",
        specialties: ["Machine Learning"]
      },
      {
        address: "Sigulda",
        id: "P003",
        specialties: []
      }
    ];
    pairs = generateAllPairs(students, practices);
  });

  afterAll(async () => {
    await db.close();
  });

  test("all pair generations", () => {
    expect(pairs).toHaveLength(9);
    const ids = pairs.map(pair => pair.getPairId());
    expect(ids).toEqual([
      "S001 <-> P001",
      "S002 <-> P001",
      "S003 <-> P001",
      "S001 <-> P002",
      "S002 <-> P002",
      "S003 <-> P002",
      "S001 <-> P003",
      "S002 <-> P003",
      "S003 <-> P003"
    ]);
  });

  test("Average calculation", async () => {
    const averages = {
      S001: 150,
      S002: 200,
      S003: 250
    };
    pairs.forEach((pair, index) => {
      pair.travelDurationByBicyclingInSeconds = index * 100;
      pair.travelDurationByCarInSeconds = index * 50;
    });
    fillAverageDistances(students, pairs);
    expect(pairs[0].averageStudentDistanceTimeInSeconds).toBe(averages.S001);
    expect(pairs[1].averageStudentDistanceTimeInSeconds).toBe(averages.S002);
    expect(pairs[2].averageStudentDistanceTimeInSeconds).toBe(averages.S003);
    expect(pairs[3].averageStudentDistanceTimeInSeconds).toBe(averages.S001);
    expect(pairs[4].averageStudentDistanceTimeInSeconds).toBe(averages.S002);
    expect(pairs[5].averageStudentDistanceTimeInSeconds).toBe(averages.S003);
    expect(pairs[6].averageStudentDistanceTimeInSeconds).toBe(averages.S001);
    expect(pairs[7].averageStudentDistanceTimeInSeconds).toBe(averages.S002);
    expect(pairs[8].averageStudentDistanceTimeInSeconds).toBe(averages.S003);
  });

  test("Pair sort Algorithm", async () => {
    const getDbKey = (
      studentAddress: string,
      practiceAddress: string,
      mode: "driving" | "bicycling"
    ) => {
      return JSON.stringify([studentAddress, practiceAddress, mode]);
    };
    await putValue(db, getDbKey("Riga", "Ventspils", "bicycling"), 70);
    await putValue(db, getDbKey("Riga", "Ventspils", "driving"), 30);
    await putValue(db, getDbKey("Daugavpils", "Ventspils", "bicycling"), 120);
    await putValue(db, getDbKey("Daugavpils", "Ventspils", "driving"), 80);
    await putValue(db, getDbKey("Cesis", "Ventspils", "bicycling"), 115);
    await putValue(db, getDbKey("Cesis", "Ventspils", "driving"), 75);
    await putValue(db, getDbKey("Jurmala", "Ventspils", "bicycling"), 200);
    await putValue(db, getDbKey("Jurmala", "Ventspils", "driving"), 140);
    await putValue(db, getDbKey("Riga", "Liepaja", "bicycling"), 150);
    await putValue(db, getDbKey("Riga", "Liepaja", "driving"), 60);
    await putValue(db, getDbKey("Daugavpils", "Liepaja", "bicycling"), 400);
    await putValue(db, getDbKey("Daugavpils", "Liepaja", "driving"), 270);
    await putValue(db, getDbKey("Cesis", "Liepaja", "bicycling"), 115);
    await putValue(db, getDbKey("Cesis", "Liepaja", "driving"), 50);
    await putValue(db, getDbKey("Jurmala", "Liepaja", "bicycling"), 200);
    await putValue(db, getDbKey("Jurmala", "Liepaja", "driving"), 30);
    await putValue(db, getDbKey("Riga", "Sigulda", "bicycling"), 15);
    await putValue(db, getDbKey("Riga", "Sigulda", "driving"), 10);
    await putValue(db, getDbKey("Daugavpils", "Sigulda", "bicycling"), 350);
    await putValue(db, getDbKey("Daugavpils", "Sigulda", "driving"), 320);
    await putValue(db, getDbKey("Cesis", "Sigulda", "bicycling"), 180);
    await putValue(db, getDbKey("Cesis", "Sigulda", "driving"), 120);
    await putValue(db, getDbKey("Jurmala", "Sigulda", "bicycling"), 200);
    await putValue(db, getDbKey("Jurmala", "Sigulda", "driving"), 20);
    const pickedPairs: IStudentPracticePair[] = await matchStudentsWithPractices(
      students,
      practices,
      {
        takeAverageDistanceIntoAccount: true
      }
    );
    expect(pickedPairs).toHaveLength(3);
    const pairIds = pickedPairs.map(pair => pair.getPairId());
    expect(pairIds.sort()).toEqual([
      "S001 <-> P003",
      "S002 <-> P001",
      "S003 <-> P002"
    ]);
    const secondStudentPair = pickedPairs.find(
      pair => pair.student.id === "S002"
    );
    expect(secondStudentPair.getStudentAddress()).toBe("Cesis"); // It should be alternative address
    await delValue(db, getDbKey("Riga", "Ventspils", "bicycling"));
    await delValue(db, getDbKey("Riga", "Ventspils", "driving"));
    await delValue(db, getDbKey("Daugavpils", "Ventspils", "bicycling"));
    await delValue(db, getDbKey("Daugavpils", "Ventspils", "driving"));
    await delValue(db, getDbKey("Cesis", "Ventspils", "bicycling"));
    await delValue(db, getDbKey("Cesis", "Ventspils", "driving"));
    await delValue(db, getDbKey("Jurmala", "Ventspils", "bicycling"));
    await delValue(db, getDbKey("Jurmala", "Ventspils", "driving"));
    await delValue(db, getDbKey("Riga", "Liepaja", "bicycling"));
    await delValue(db, getDbKey("Riga", "Liepaja", "driving"));
    await delValue(db, getDbKey("Daugavpils", "Liepaja", "bicycling"));
    await delValue(db, getDbKey("Daugavpils", "Liepaja", "driving"));
    await delValue(db, getDbKey("Cesis", "Liepaja", "bicycling"));
    await delValue(db, getDbKey("Cesis", "Liepaja", "driving"));
    await delValue(db, getDbKey("Jurmala", "Liepaja", "bicycling"));
    await delValue(db, getDbKey("Jurmala", "Liepaja", "driving"));
    await delValue(db, getDbKey("Riga", "Sigulda", "bicycling"));
    await delValue(db, getDbKey("Riga", "Sigulda", "driving"));
    await delValue(db, getDbKey("Daugavpils", "Sigulda", "bicycling"));
    await delValue(db, getDbKey("Daugavpils", "Sigulda", "driving"));
    await delValue(db, getDbKey("Cesis", "Sigulda", "bicycling"));
    await delValue(db, getDbKey("Cesis", "Sigulda", "driving"));
    await delValue(db, getDbKey("Jurmala", "Sigulda", "bicycling"));
    await delValue(db, getDbKey("Jurmala", "Sigulda", "driving"));
  });
});
