import {
  SPLITTER,
  LINE_SPLITTER,
  parseEntry,
  studentTypeMap,
  practiceTypeMap,
  parseEntries
} from "../utils/Parser";
import { IStudent } from "../typings/IStudent";
import { IPractice } from "../typings/IPractice";

describe("Entry parsing", () => {
  test("one student parsing", () => {
    const titleLine = `id	address	alternativeAddress1	alternativeAddress2	hasCar	hasChildren	favoriteSpecialties`;
    const studentLine = `S001	Am Waldacker 21c, 60388 Frankfurt am Main	Pforzheimer Straße 15, 60329 Frankfurt am Main	Im Wörth 8, 60433 Frankfurt am Main	0	1	Notfallmedizin, Kinder-Endokrinologie und -Diabetologie`;
    const student = parseEntry(
      studentLine,
      titleLine.split("\t"),
      studentTypeMap
    );
    expect(student).toMatchObject<IStudent>({
      address: "Am Waldacker 21c, 60388 Frankfurt am Main",
      alternativeAddress1: "Pforzheimer Straße 15, 60329 Frankfurt am Main",
      alternativeAddress2: "Im Wörth 8, 60433 Frankfurt am Main",
      favoriteSpecialties: [
        "Notfallmedizin",
        "Kinder-Endokrinologie und -Diabetologie"
      ],
      hasCar: false,
      hasChildren: true,
      id: "S001"
    });
  });

  test("one practice parsing", () => {
    const titleLine = `id	address	specialties`;
    const practiceLine = `P001	Rhaban-Fröhlich-Straße 11, 60433 Frankfurt am Main	Sportmedizin, Notfallmedizin`;
    const student = parseEntry(
      practiceLine,
      titleLine.split("\t"),
      practiceTypeMap
    );
    expect(student).toMatchObject<IPractice>({
      address: "Rhaban-Fröhlich-Straße 11, 60433 Frankfurt am Main",
      id: "P001",
      specialties: ["Sportmedizin", "Notfallmedizin"]
    });
  });

  test("multiple student parsing", () => {
    const titleLine = `id	address	alternativeAddress1	alternativeAddress2	hasCar	hasChildren	favoriteSpecialties`;
    const studentLine = `S001	Am Waldacker 21c, 60388 Frankfurt am Main	Pforzheimer Straße 15, 60329 Frankfurt am Main	Im Wörth 8, 60433 Frankfurt am Main	0	0	Notfallmedizin, Kinder-Endokrinologie und -Diabetologie`;
    const studentLine2 = `S002	Storchgasse 2, 65929 Frankfurt am Main	Triebstraße 45, 60388 Frankfurt am Main	Eifelstraße 51, 60529 Frankfurt am Main	0	0	Notfallmedizin, Hämostaseologie`;
    const correctStudent1 = parseEntry(
      studentLine,
      titleLine.split(SPLITTER),
      studentTypeMap
    );
    const correctStudent2 = parseEntry(
      studentLine2,
      titleLine.split(SPLITTER),
      studentTypeMap
    );
    const CSVData = [titleLine, studentLine, studentLine2].join(LINE_SPLITTER);
    const students = parseEntries(CSVData, studentTypeMap);
    expect(students).toHaveLength(2);
    expect(students[0]).toMatchObject(correctStudent1);
    expect(students[1]).toMatchObject(correctStudent2);
  });
});
