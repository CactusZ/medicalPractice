import IDatastore from "typings/IDatastore";
import { IPractice } from "typings/IPractice";
import { IStudent } from "typings/IStudent";
import * as fs from "fs";
import { parseEntries, studentTypeMap, practiceTypeMap } from "./utils/Parser";

export default class Datastore implements IDatastore {
  private students: IStudent[];
  private practices: IPractice[];

  public clear(): void {
    this.students = [];
    this.practices = [];
  }

  public getPractices(): IPractice[] {
    return this.practices.slice();
  }

  public getStudents(): IStudent[] {
    return this.students.slice();
  }

  public readPracticesFromCSVFile(practicesCSVFilePath: string): void {
    const data = fs.readFileSync(practicesCSVFilePath);
    this.practices = parseEntries<IPractice>(String(data), practiceTypeMap);
  }

  public readStudentsFromCSVFile(studentsCSVFilePath: string): void {
    const data = fs.readFileSync(studentsCSVFilePath);
    this.students = parseEntries<IStudent>(String(data), studentTypeMap);
  }
}
