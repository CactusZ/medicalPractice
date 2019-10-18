import { IStudentPracticePair } from "typings/IStudentPracticePair";
import { IPractice } from "typings/IPractice";
import { IStudent } from "typings/IStudent";

// TODO: Write tests and implement
export class StudentPracticePair implements IStudentPracticePair {
  public isAlternativeAddress1: boolean;
  public isAlternativeAddress2: boolean;
  public practice: IPractice;
  public student: IStudent;
  public travelDurationByBicyclingInSeconds: number;
  public travelDurationByCarInSeconds: number;

  public fetchTravelDurationsFromCacheOrAPI(): Promise<void> {
    return undefined;
  }

  public getFastestTransportDuration(): number {
    return 0;
  }

  public getFastestTransportMode(): string {
    return "";
  }

  public getPairId(): string {
    return "";
  }

  public getPairWeight(): number {
    return 0;
  }

  public getStudentAddress(): string {
    return "";
  }

  public resetCachedTravelValues(): Promise<void> {
    return undefined;
  }
}
