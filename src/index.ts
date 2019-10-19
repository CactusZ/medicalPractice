import Datastore from "./Datastore";
import * as path from "path";
import matchStudentsWithPractices from "./PairMatcher";
import * as fs from "fs";

const ds = new Datastore();
ds.readPracticesFromCSVFile(path.join(__dirname, "../data/practices.csv"));
ds.readStudentsFromCSVFile(path.join(__dirname, "../data/students.csv"));

matchStudentsWithPractices(ds.getStudents(), ds.getPractices(), {
  takeAverageDistanceIntoAccount: true
}).then(pairs => {
  const pathToFile = path.join(__dirname, "../data/results.csv");
  const buffer = new Buffer(
    pairs.map(pair => pair.mapToCSVString()).join("\n")
  );

  fs.open(pathToFile, "w", (err, fd) => {
    if (err) {
      throw new Error("error opening file: " + err);
    }

    fs.write(fd, buffer, 0, buffer.length, null, err => {
      if (err) {
        throw new Error("error writing file: " + err);
      }
      fs.close(fd, () => {
        // tslint:disable-next-line:no-console
        console.log("file written");
      });
    });
  });
});
