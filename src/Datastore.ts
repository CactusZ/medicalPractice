import IDatastore from "typings/IDatastore";
import {IPractice} from "typings/IPractice";
import {IStudent} from "typings/IStudent";

// TODO: Write tests and implement
export default class Datastore implements IDatastore {
  clear(): void {
  }

  getPractices(): IPractice[] {
    return [];
  }

  getStudents(): IStudent[] {
    return [];
  }

  readPracticesFromCSVFile(practicesCSVFilePath: string): void {
  }

  readStudentsFromCSVFile(studentsCSVFilePath: string): void {
  }

}
