function buildQuizPrompt(topic, numberOfQuestions) {
  return `Hi, Create a Kahoot-style quiz in JSON format with the following structure:

{
  "title": "Your Quiz Title",
  "questions": [
    {
      "question": "Question text goes here?",
      "answers": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
      "correctIndex": 0,
      "timeLimit": 20
    }
    // More questions...
  ]
}

Requirements:
Generate ${numberOfQuestions} multiple-choice questions about ${topic}
Each question must have exactly 4 answer options
The correctIndex should be the 0-based index of the correct answer (0-3)
timeLimit specifies how many seconds users have to answer (10-30 seconds)
Make questions engaging and varied in difficulty
Include a mix of text-based questions
Ensure there is only one correct answer per question
Give the quiz an appropriate title

Please format your output as valid JSON that can be directly used inside a quiz application.`;
}

export default buildQuizPrompt;
