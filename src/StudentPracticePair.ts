import { IStudentPracticePair } from "typings/IStudentPracticePair";
import {IPractice} from "typings/IPractice";
import {IStudent} from "typings/IStudent";

// TODO: Write tests and implement
export class StudentPracticePair implements IStudentPracticePair {
  isAlternativeAddress1: boolean;
  isAlternativeAddress2: boolean;
  practice: IPractice;
  student: IStudent;
  travelDurationByBicyclingInSeconds: number;
  travelDurationByCarInSeconds: number;

  fetchTravelDurationsFromCacheOrAPI(): Promise<void> {
    return undefined;
  }

  getFastestTransportDuration(): number {
    return 0;
  }

  getFastestTransportMode(): string {
    return "";
  }

  getPairId(): string {
    return "";
  }

  getPairWeight(): number {
    return 0;
  }

  getStudentAddress(): string {
    return "";
  }

  resetCachedTravelValues(): Promise<void> {
    return undefined;
  }
}
