import { LevelUp } from "levelup";
import { LevelDown } from "leveldown";
import { AbstractIterator } from "abstract-leveldown";

export async function putValue(db: Db, key: string, value: unknown) {
  return db.put(key, JSON.stringify(value));
}

export async function getValue<T>(db: Db, key: string): Promise<T> {
  try {
    const bytes = await db.get(key);
    return JSON.parse(String(bytes));
  } catch (e) {
    return null;
  }
}

export type Db = LevelUp<LevelDown, AbstractIterator<any, any>>;
