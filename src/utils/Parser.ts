import { IStudent } from "typings/IStudent";
import { IPractice } from "typings/IPractice";
import { ITypeMap } from "typings/IDatastore";

export const LINE_SPLITTER = "\n";
export const SPLITTER = "\t";
export const ARRAY_SPLITTER = ", ";

export const studentTypeMap: ITypeMap<IStudent> = {
  address: "string",
  alternativeAddress1: "string",
  alternativeAddress2: "string",
  favoriteSpecialties: "array",
  hasCar: "boolean",
  hasChildren: "boolean",
  id: "string"
};

export const practiceTypeMap: ITypeMap<IPractice> = {
  address: "string",
  id: "string",
  specialties: "array"
};

export function parseEntries<T>(data: string, typeMap: ITypeMap<T>): T[] {
  const lines = data.split(LINE_SPLITTER).filter(l => l.length); // filter empty lines if any
  const titleLine = lines[0];
  const titleLineParts = titleLine.split(SPLITTER);
  return lines
    .slice(1)
    .map(line => this.parseEntry(line, titleLineParts, typeMap));
}

export function parseEntry<T>(
  csvEntryLine: string,
  titleLineParts: string[],
  typeMap: ITypeMap<T>
): T {
  const lineParts = csvEntryLine.split(SPLITTER);
  return titleLineParts.reduce<T>(
    (resultObject, key, index) => {
      let value: string | boolean | string[] = lineParts[index];
      if (typeMap[key] === "boolean") {
        value = Boolean(+value);
      } else if (typeMap[key] === "array") {
        value = value.split(ARRAY_SPLITTER);
        if (value.length === 1 && value[0] === '""') {
          value = [];
        }
      }
      resultObject[key] = value;
      return resultObject;
    },
    {} as any
  );
}
