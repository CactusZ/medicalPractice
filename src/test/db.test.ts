import { putValue, getValue, delValue } from "../utils/dbHelpers";
import db from "../db";

describe("db functionality", () => {
  test("putValue and getValue functions", async () => {
    expect.assertions(1);
    const key = JSON.stringify([
      "test",
      "destination1",
      "destination2",
      "bicycle"
    ]);
    const value = 42;
    await putValue(db, key, value);
    const valueFound = await getValue(db, key);
    await delValue(db, key);
    expect(valueFound).toBe(value);
  });

  test("getValue non existing key", async () => {
    const key = JSON.stringify(["unknown"]);
    const val = await getValue(db, key);
    expect(val).toBeNull();
  });

  test("remove value", async () => {
    expect.assertions(2);
    const key = JSON.stringify([
      "test",
      "destination1",
      "destination2",
      "bicycle"
    ]);
    const value = 42;
    await putValue(db, key, value);
    let valueFound = await getValue(db, key);
    expect(valueFound).toBe(value);
    await delValue(db, key);
    valueFound = await getValue(db, key);
    expect(valueFound).toBeNull();
  });

  afterAll(async () => {
    await db.close();
  });
});
