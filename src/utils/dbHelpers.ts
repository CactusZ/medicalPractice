import { LevelUp } from "levelup";
import { LevelDown } from "leveldown";
import { AbstractIterator } from "abstract-leveldown";

export function putValue(db: Db, key: string, value: unknown) {
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

export async function delValue(db: Db, key: string) {
  try {
    await db.del(key);
  } catch (e) {
    return;
  }
}

export type Db = LevelUp<LevelDown, AbstractIterator<any, any>>;
