import levelup from "levelup";
import leveldown from "leveldown";

const db = levelup(leveldown("./db"));

export function putValue(key: string, value: unknown) {
  return db.put(key, JSON.stringify(value));
}

export async function getValue<T>(key: string): Promise<T> {
  const bytes = await db.get(key);
  return JSON.parse(String(bytes));
}

export default db;
