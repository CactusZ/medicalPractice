import { IStudentPracticePair } from "typings/IStudentPracticePair";
import { IPractice } from "typings/IPractice";
import { IStudent } from "typings/IStudent";
import googleMapsClient from "./googleMapsClient";
import { getValue, putValue, delValue } from "./utils/dbHelpers";
import db from "./db";

export const MAX_DISTANCE_SCORE = 1e5;
export const AVERAGE_DISTANCE_OFFSET = MAX_DISTANCE_SCORE;
export const MATCHING_SPECIALTY_OFFSET =
  AVERAGE_DISTANCE_OFFSET * MAX_DISTANCE_SCORE;
export const MATCHING_SPECIALTY_SCORE = MATCHING_SPECIALTY_OFFSET * 10;
export const HAS_CHILD_OFFSET = MATCHING_SPECIALTY_SCORE;
export const HAS_CHILD_SCORE = HAS_CHILD_OFFSET * 10;

export class StudentPracticePair implements IStudentPracticePair {
  public isAlternativeAddress1: boolean;
  public isAlternativeAddress2: boolean;
  public practice: IPractice;
  public student: IStudent;
  public travelDurationByBicyclingInSeconds: number;
  public travelDurationByCarInSeconds: number;
  public averageStudentDistanceTimeInSeconds: number;

  public constructor(student: IStudent, practice: IPractice) {
    this.student = student;
    this.practice = practice;
  }

  public async fetchTravelDurationsFromCacheOrAPI(): Promise<void> {
    const addresses = [
      this.student.address,
      this.student.alternativeAddress1,
      this.student.alternativeAddress2
    ];
    const bicyclePromise: Promise<number[]> = Promise.all(
      addresses.map(address => {
        if (address) {
          return this.fetchTravelDurationFromCacheOrAPI(address, "bicycling");
        } else {
          return Promise.resolve(Infinity);
        }
      })
    );
    let carPromise: Promise<number[]> = Promise.resolve([
      Infinity,
      Infinity,
      Infinity
    ]);
    if (this.student.hasCar) {
      carPromise = Promise.all(
        addresses.map(address => {
          if (address) {
            return this.fetchTravelDurationFromCacheOrAPI(address, "driving");
          } else {
            return Infinity;
          }
        })
      );
    }
    const [bicycleDurations, carDurations] = await Promise.all([
      bicyclePromise,
      carPromise
    ]);
    const minBicycle = Math.min(...bicycleDurations);
    const minCar = Math.min(...carDurations);
    const min = Math.min(minBicycle, minCar);
    if (min === bicycleDurations[0] || min === carDurations[0]) {
      this.travelDurationByCarInSeconds = carDurations[0];
      this.travelDurationByBicyclingInSeconds = bicycleDurations[0];
      this.isAlternativeAddress1 = false;
      this.isAlternativeAddress2 = false;
    } else if (min === bicycleDurations[1] || min === carDurations[1]) {
      this.travelDurationByCarInSeconds = carDurations[1];
      this.travelDurationByBicyclingInSeconds = bicycleDurations[1];
      this.isAlternativeAddress1 = true;
      this.isAlternativeAddress2 = false;
    } else if (min === bicycleDurations[2] || min === carDurations[2]) {
      this.travelDurationByCarInSeconds = carDurations[2];
      this.travelDurationByBicyclingInSeconds = bicycleDurations[2];
      this.isAlternativeAddress1 = false;
      this.isAlternativeAddress2 = true;
    }
  }

  public async fetchTravelDurationFromCacheOrAPI(
    studentAddress: string,
    mode: "driving" | "bicycling"
  ): Promise<number> {
    const key = this.getDbKey(studentAddress, mode);
    const cacheValue = await getValue<number>(db, key);
    if (cacheValue === null) {
      const durationFromApi = await this.callApi(studentAddress, mode);
      await putValue(db, key, durationFromApi);
      return durationFromApi;
    }
    return cacheValue;
  }

  public getDbKey(studentAddress: string, mode: "driving" | "bicycling") {
    return JSON.stringify([studentAddress, this.practice.address, mode]);
  }

  public async callApi(studentAddress: string, mode: "driving" | "bicycling") {
    const destinations = [this.practice.address];
    try {
      const res = await googleMapsClient
        .distanceMatrix({
          destinations,
          mode,
          origins: [studentAddress]
        })
        .asPromise();
      if (res.status !== 200) {
        throw new Error("Response HTTP status:" + res.status);
      }
      if (!res.json || res.json.status !== "OK") {
        throw new Error(
          "Response JSON status:" +
            (res.json && res.json.status) +
            " Error message:" +
            (res.json && res.json.error_message)
        );
      }
      if (
        !res.json.rows ||
        !res.json.rows.length ||
        !res.json.rows[0].elements ||
        !res.json.rows[0].elements.length ||
        !res.json.rows[0].elements[0] ||
        !res.json.rows[0].elements[0].duration ||
        typeof res.json.rows[0].elements[0].duration.value !== "number"
      ) {
        throw new Error("Wrong JSON structure, check API. JSON:" + res.json);
      }
      return res.json.rows[0].elements[0].duration.value;
    } catch (e) {
      throw new Error("Error connecting to API " + e);
    }
  }

  public getFastestTransportDuration(): number {
    return Math.min(
      this.travelDurationByBicyclingInSeconds,
      this.travelDurationByCarInSeconds
    );
  }

  public getFastestTransportMode() {
    return this.travelDurationByBicyclingInSeconds <
      this.travelDurationByCarInSeconds
      ? "Bicycle"
      : "Car";
  }

  public getPairId(): string {
    return `${this.student.id} <-> ${this.practice.id}`;
  }

  public getPairWeight(): number {
    let score = 0;

    if (this.student.hasChildren) {
      score += HAS_CHILD_SCORE;
    }
    if (this.hasMatchingSpecialties()) {
      score += MATCHING_SPECIALTY_SCORE;
    }
    if (this.averageStudentDistanceTimeInSeconds) {
      const distanceScore =
        MAX_DISTANCE_SCORE - this.averageStudentDistanceTimeInSeconds;
      score += distanceScore * AVERAGE_DISTANCE_OFFSET;
    }
    score += MAX_DISTANCE_SCORE - this.getFastestTransportDuration(); // let's assume there are no student with more than 24h travel time to any practice
    return score;
  }

  public hasMatchingSpecialties() {
    for (const practiceSpecialty of this.practice.specialties) {
      if (this.student.favoriteSpecialties.includes(practiceSpecialty)) {
        return true;
      }
    }
    return false;
  }

  public setAverageDistance(distanceInSeconds: number) {
    this.averageStudentDistanceTimeInSeconds = distanceInSeconds;
  }

  public getStudentAddress(): string {
    let address = this.student.address;
    if (this.isAlternativeAddress1) {
      address = this.student.alternativeAddress1;
    } else if (this.isAlternativeAddress2) {
      address = this.student.alternativeAddress2;
    }
    return address;
  }

  public async resetCachedTravelValues() {
    const addresses = [
      this.student.address,
      this.student.alternativeAddress1,
      this.student.alternativeAddress2
    ];
    const bicyclePromise: Promise<unknown> = Promise.all(
      addresses.map(address => {
        return delValue(db, this.getDbKey(address, "bicycling"));
      })
    );
    const carPromise: Promise<unknown> = Promise.all(
      addresses.map(address => {
        return delValue(db, this.getDbKey(address, "driving"));
      })
    );

    await Promise.all([bicyclePromise, carPromise]);
  }
}
