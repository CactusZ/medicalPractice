import { IStudent } from "typings/IStudent";
import { IPractice } from "typings/IPractice";
import { IStudentPracticePair } from "typings/IStudentPracticePair";
import { StudentPracticePair } from "./StudentPracticePair";
import { IConfig } from "typings/IPairMatcher";

export default async function matchStudentsWithPractices(
  students: IStudent[],
  practices: IPractice[],
  config?: IConfig
): Promise<IStudentPracticePair[]> {
  const allPairs = generateAllPairs(students, practices);
  for (const pair of allPairs) {
    await pair.fetchTravelDurationsFromCacheOrAPI();
  }
  if (config && config.takeAverageDistanceIntoAccount) {
    fillAverageDistances(students, allPairs);
  }
  allPairs.sort(comparePairWeights);
  return pickPairs(allPairs);
}

export function generateAllPairs(
  students: IStudent[],
  practices: IPractice[]
): IStudentPracticePair[] {
  const result = [];
  for (const practice of practices) {
    for (const student of students) {
      result.push(new StudentPracticePair(student, practice));
    }
  }
  return result;
}

export function fillAverageDistances(
  students: IStudent[],
  pairs: IStudentPracticePair[]
) {
  for (const student of students) {
    const studentPairs = pairs.filter(pair => pair.student.id === student.id);
    const sum = studentPairs.reduce(
      (res, pair) => res + pair.getFastestTransportDuration(),
      0
    );
    const avg = Math.round(sum / studentPairs.length);
    for (const pair of studentPairs) {
      pair.setAverageDistance(avg);
    }
  }
}

function pickPairs(allPairs: IStudentPracticePair[]) {
  let index = 0;
  const pickedStudentsHash: {
    [studentId: string]: boolean;
  } = {};
  const pickedPracticesHash: {
    [practiceId: string]: boolean;
  } = {};
  const resultingPairs: IStudentPracticePair[] = [];
  while (index < allPairs.length) {
    const pair = allPairs[index];
    const studentId = pair.student.id;
    const practiceId = pair.practice.id;
    const isStudentPicked = pickedStudentsHash[studentId];
    const isPracticeTaken = pickedPracticesHash[practiceId];
    if (!isStudentPicked && !isPracticeTaken) {
      pickedStudentsHash[studentId] = true;
      pickedPracticesHash[practiceId] = true;
      resultingPairs.push(pair);
    }
    index++;
  }
  return resultingPairs;
}

// Helper function for sorting pairs by weights
const comparePairWeights = (a: StudentPracticePair, b: StudentPracticePair) => {
  if (a.getPairWeight() > b.getPairWeight()) {
    return -1;
  }
  if (a.getPairWeight() < b.getPairWeight()) {
    return 1;
  }
  return 0;
};
