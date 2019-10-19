Hello!

This is explanation of Algorithm I have developed in order to build solution for this task.

The main idea is to assign every possible student - practice pair a score (weight) that is used to determine which pair will be picked first.
Score must take into account:
* If student has child
* If student and practive have matching specialties
* Student travel duration to practice

The main question while developing this algorithm was "How can I make it more fair?".  
I have implemented algorithm option (which can be disabled, 
but I have enabled it while generating results) which indicates whether we should take 
into account average distance from student to all practices.  
  
Why average distance?  
  
My assumption was:   
Let's say we have 2 students: Student A and Student B.  
For them the best practice is Practice P, so we have to decide which of the students will be assigned to it.  
Students A and B do not have a child and matching specialties with P.  
It takes 0.5h for student A to reach P, and 2h for student B to reach P.  
Average travel time for student A to all practices is ~1h. The same for B - 3h.  
I thought that it would be fair to assign student B to this practice, 
because student A is in more priveleged position ( he is closer to other practices than B).  
If we assign student A, student B will have to spend even more to next practice.  
For example, majority of students live in city, while minority lives outside. 
All practices are in City.  
Idea is to give minority closest practices (closer to border), 
while students who live in city near that border can be assigned to city center, for example.  

So taking all above mentioned factors into account we can calculate for each pair a score.  

Score is an Integer value (up to 13 digits) and it's format is (from the end):  
* 5 digits - "inverse" best travel duration from student to practice. "Inverse" value = (100000 - travel duration), so the less duration, the bigger the score
* 5 digits -  (if takeIntoAccountOption enabled, otherwise 00000) average student travel duration to all practices
* 1 digit - whether there are matching specialties in pair
* 1 digit - whether student has a child

I believe my distribution is close to "fair" (we try to take care about people who live far away), however it may be better to replace average with max distance to practice or any other similar characteristic
