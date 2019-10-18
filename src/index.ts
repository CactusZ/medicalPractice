import Datastore from "./Datastore";
import * as path from "path";
import { StudentPracticePair } from "./StudentPracticePair";

// Helper function you can use for sorting pairs by weights
const comparePairWeights = (a: StudentPracticePair, b: StudentPracticePair) => {
  if (a.getPairWeight() > b.getPairWeight()) {
    return -1;
  }
  if (a.getPairWeight() < b.getPairWeight()) {
    return 1;
  }
  return 0;
};

const ds = new Datastore();
ds.readPracticesFromCSVFile(path.join(__dirname, "../data/practices.csv"));
ds.readStudentsFromCSVFile(path.join(__dirname, "../data/students.csv"));

// TODO: Compute and write assigned pairs to `pairs.csv`
