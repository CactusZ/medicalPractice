# Coding and Problem Solving Exercise
For R&D position candidates at Idana (Tomes GmbH, Freiburg im Breisgau)

### Description
In this exercise you will design and implement an algorithm that assigns medical students to practices.

**Time:** We've created an example solution ourselves that is *not in use yet*. Implementing the solution took Jerome about 10 hours. You might as well be faster or take more time for it. The time constraint is 48h from when you've received this exercise.

**Relevance:** The existing algorithm for assigning medical students of the University of Freiburg might be improved using the input of your solution to this exercise. This means you are helping to solve a real-world problem by taking this exercise. This exercise shows that you understand:
* How to fully read and understand an exercise task
* How to design an efficient algorithm for a complex problem
* How to use test-driven development to build software in a sustainable way
* How to use a publicly available and documented API and don't ignore quotas
* How to use Travis CI to automatically build and test your implementation
* How to describe what decisions you have taken and why

### Exercise tasks
1. Implement the functions of the _Datastore_ class. You can add any third-party NPM libraries to facilitate this task.
2. Instanciate and fill the _Datastore_ using the two input files `src/data/practices.csv` and `src/data/students.csv`.
3. Create a .travis.yml file to automatically run compilation and tests and generate a code coverage report using Travis CI on every commit you make.
4. Design and implement an algorithm that weights student-practice pairs by taking into account the data that has been given by the students.
   1. Use the Distance Matrix provided by the [Google Directions API](https://github.com/googlemaps/google-maps-services-js/blob/master/spec/e2e/directions-spec.js) to query the route durations between students and practices to assign weights. You can find the Google Directions API Key in the e-mail that I've sent you. It's easiest to paste it into the `.env` file and use `googleMapsClient.ts` provided by us.
   2. Please take into account alternative addresses of students. If they get better practice assignments in one of their alternative addresses you might assign them there (they'd have to move e.g. to their parents in that case).
   3. If the student has a car, take into account the time it takes to go to the practice by car otherwise take into account the time it takes to go by bicycling.
   4. **Attention:** Please make sure to cache the Distance matrix results. You can use `db.ts` which is provided by us. It is a simple key-value storage. Please make sure to **only send one query per practice-student pair and method (car vs. bicycling)**. Explanation at the end of the sheet.
   5. Assign weights for matching specialty wishes by students and the specialties of the practices.
   6. Students with children should be prioritized over students without children.
   7. From all possible combinations, select the best Student-Practice pairs. **Hint:** You can sort by weights and fix assignments iteratively until no pairs are left to assign. Student-practice pairs that have the same weights might as well be randomly assigned.
5. Execute the algorithm using the provided test datasets (`src/data/practices.csv` and `src/data/students.csv`) as input and save all the assigned student-practice pairs to a CSV file. Each line should be in the following format:
```
Pair          | Weight | Address of the Student                   | Address of the Practice                | Required to move (No, Alternative 1, Alternative 2) | Children (Yes, No) | Travel Mode (Bicycle, Car)  | Duration (Minutes)     | Matching specialties
S012 <-> P012 | 9711   | Ulrichstraße 43, 60433 Frankfurt am Main | Kantstraße 13, 60316 Frankfurt am Main | No                                                  | No                 | Bicycle                     |                     18 | Stimm- und Sprechstörungen
```
6. Create a `Algorithm.md` file and explain in detail the decisions that you've made while designing the algorithm and the problems that you've faced during the algorithm design process. Please also explain, if you think the distribution of students to practices that your algorithm has produced is fair or not, and why?
7. Make sure to commit and push all your changes to a public GitHub repository which you will then share with us.
8. Make sure that Travis CI builds the project and runs the automated tests successfully and created a code coverage report. **Remember to keep our Google Maps API Key secret!**

### Guidelines for the coding exercise:
Our coding conventions must be followed. In particular:
1. You have to write a Jest test for each non-trivial method. One non-trivial example per unit
test is enough. All unit tests must be fast.
2. You have to adhere to the coding style enforced by prettier and tslint.
3. Make sure that you do not upload any “by-products” to the Git repository (e.g., .env files, files containing sensitive content,
temporary files or any stuff from your local environment).

### Explanations of API quotas
* 1.000 bicycle API requests cost us 5.00 USD.
* 1.000 car API requests cost us 10.00 USD.
* There are 80 * 50 bicycle pairs equivalent to 4.000 requests a 5.00 USD.
* There are 16 * 50 car pairs equivalent to 800 requests a 10.00 USD.
* This means you should not do a lot more than 4.800 requests in total.
* This means you should not use a lot more than 28.00 USD.
