import { IPractice } from "typings/IPractice";
import { IStudent } from "typings/IStudent";

// This is only a hint. You can change this as you wish.
export interface IStudentPracticePair {
  student: IStudent;
  practice: IPractice;
  isAlternativeAddress1: boolean; // Should be true, if this pair is using the students alternative address 1
  isAlternativeAddress2: boolean; // Should be true, if this pair is using the students alternative address 2
  travelDurationByCarInSeconds: number;
  travelDurationByBicyclingInSeconds: number;
  getPairId(): string;
  getPairWeight(): number;
  resetCachedTravelValues(): Promise<void>;
  fetchTravelDurationsFromCacheOrAPI(): Promise<void>;
  getStudentAddress(): string;
  getFastestTransportMode(): string;
  getFastestTransportDuration(): number;
}
