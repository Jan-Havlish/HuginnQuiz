import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import QuizSetup from "./components/QuizSetup";
import QuizQuestion from "./components/QuizQuestion";
import QuizResults from "./components/QuizResults";
import { sampleQuizJson } from "./sample";

const App = () => {
  // State variables
  const [screen, setScreen] = useState("start"); // 'start', 'question', 'results'
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [jsonInput, setJsonInput] = useState(sampleQuizJson);
  const [validJson, setValidJson] = useState(sampleQuizJson);
  const [jsonError, setJsonError] = useState("");

  // Handle changes in the textarea
  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonInput(value);
    try {
      JSON.parse(value);
      setValidJson(value);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON: " + error.message);
    }
  };

  const startQuiz = () => {
    // Prevent starting quiz if JSON is invalid
    if (jsonError) {
      alert("Please fix the JSON errors before starting the quiz.");
      return;
    }
    try {
      const parsedQuiz = JSON.parse(validJson);
      if (
        !parsedQuiz.questions ||
        !Array.isArray(parsedQuiz.questions) ||
        parsedQuiz.questions.length === 0
      ) {
        throw new Error("Invalid quiz format: questions array is required");
      }
      // Setup the quiz
      setQuiz(parsedQuiz);
      setCurrentQuestionIndex(0);
      setScore(0);
      setResults([]);
      setScreen("question");
    } catch (error) {
      alert(
        `Error: ${error.message}. Please check your JSON format and try again.`,
      );
    }
  };

  const selectAnswer = (answerIndex) => {
    const question = quiz.questions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correctIndex;
    recordResult(isCorrect, answerIndex);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1000);
    }
    setTimeout(nextQuestion, 1500);
  };

  const recordResult = (isCorrect, selectedAnswerIndex) => {
    const question = quiz.questions[currentQuestionIndex];
    setResults((prevResults) => [
      ...prevResults,
      {
        question: question.question,
        isCorrect: isCorrect,
        selectedAnswer:
          selectedAnswerIndex !== null
            ? question.answers[selectedAnswerIndex]
            : null,
        correctAnswer: question.answers[question.correctIndex],
      },
    ]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setScreen("results");
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setResults([]);
    setScreen("start");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row p-8 max-w-8xl mx-auto w-full gap-8">
        {screen === "start" && (
          <QuizSetup
            jsonInput={jsonInput}
            handleJsonChange={handleJsonChange}
            jsonError={jsonError}
            startQuiz={startQuiz}
            validJson={validJson}
            setJsonInput={setJsonInput}
            setValidJson={setValidJson}
            setJsonError={setJsonError}
          />
        )}

        {screen === "question" && quiz && (
          <QuizQuestion
            quiz={quiz}
            currentQuestionIndex={currentQuestionIndex}
            score={score}
            selectAnswer={selectAnswer}
          />
        )}

        {screen === "results" && (
          <QuizResults score={score} results={results} resetQuiz={resetQuiz} />
        )}
      </main>

      {screen === "start" && <Footer />}
    </div>
  );
};

export default App;
