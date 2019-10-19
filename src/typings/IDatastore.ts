import { IPractice } from "./IPractice";
import { IStudent } from "./IStudent";

export default interface IDatastore {
  clear(): void;
  readPracticesFromCSVFile(practicesCSVFilePath: string): void;
  readStudentsFromCSVFile(studentsCSVFilePath: string): void;
  getPractices(): IPractice[];
  getStudents(): IStudent[];
}

export type ITypeMap<T> = {
  [key in keyof T]: "string" | "array" | "boolean";
};
