import { IPractice } from "typings/IPractice";
import { IStudent } from "typings/IStudent";

export interface IStudentPracticePair {
  student: IStudent;
  practice: IPractice;
  isAlternativeAddress1: boolean; // Should be true, if this pair is using the students alternative address 1
  isAlternativeAddress2: boolean; // Should be true, if this pair is using the students alternative address 2
  travelDurationByCarInSeconds: number;
  travelDurationByBicyclingInSeconds: number;
  averageStudentDistanceTimeInSeconds: number;
  getPairId(): string;
  getPairWeight(): number;
  resetCachedTravelValues(): Promise<void>;
  fetchTravelDurationsFromCacheOrAPI(): Promise<void>;
  getStudentAddress(): string;
  getFastestTransportMode(): string;
  getFastestTransportDuration(): number;
  setAverageDistance(distance: number): void;
  callApi(
    studentAddress: string,
    mode: "driving" | "bicycling"
  ): Promise<number>;
  getDbKey(studentAddress: string, mode: "driving" | "bicycling"): string;
}
