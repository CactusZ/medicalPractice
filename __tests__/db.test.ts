import db, { putValue, getValue } from "../src/db";

describe("db functionality", () => {
  test("db get/put functionality", async () => {
    expect.assertions(1);
    const key = JSON.stringify(["test","destination1", "destination2", "car"]);
    const value = JSON.stringify(34765);
    await db.put(key, value);
    const valueFound = await db.get(key).then((bytesValue) => {
      return JSON.parse(String(bytesValue));
    });
    await db.del(key);
    expect(valueFound).toBe(34765);
  });

  test("putValue and getValue functions", async () => {
    expect.assertions(1);
    const key = JSON.stringify(["test", "destination1", "destination2", "bicycle"]);
    const value = 42;
    await putValue(key, value);
    const valueFound = await getValue(key);
    await db.del(key);
    expect(valueFound).toBe(value);
  });

  afterAll(async () => {
    await db.close();
  })
});
