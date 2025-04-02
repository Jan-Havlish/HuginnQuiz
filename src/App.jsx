import React, { useState, useEffect /* Added useEffect */ } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import QuizSetup from "./components/QuizSetup";
import QuizQuestion from "./components/QuizQuestion";
import QuizResults from "./components/QuizResults";
import { sampleQuizJson } from "./sample";

const App = () => {
  // State variables
  const [screen, setScreen] = useState("start"); // 'start', 'question', 'results'
  const [quiz, setQuiz] = useState(null); // Holds the *parsed* quiz object when active
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // For storing answers during the quiz

  // State for JSON handling - managed here, passed to QuizSetup
  const [jsonInput, setJsonInput] = useState(sampleQuizJson); // Raw input (less critical now)
  const [validJson, setValidJson] = useState(sampleQuizJson); // Stringified valid JSON
  const [jsonError, setJsonError] = useState("");

  // Effect to load initial sample JSON correctly on mount
  useEffect(() => {
    try {
      // Validate the initial sample JSON string
      JSON.parse(sampleQuizJson);
      setValidJson(sampleQuizJson);
      setJsonError("");
    } catch (error) {
      console.error("Initial sample JSON is invalid:", error);
      setValidJson(null); // Start with no valid JSON if sample is broken
      setJsonError("Error in initial sample JSON.");
    }
  }, []); // Runs only once on mount

  // --- Quiz Lifecycle Functions ---

  const startQuiz = () => {
    // This function now relies on validJson state being up-to-date
    if (!validJson) {
      alert("Nelze spustit kvíz, chybí validní data JSON.");
      setScreen("start"); // Ensure user is back at setup
      return;
    }
    if (jsonError) {
      // Double check for safety
      alert("Prosím, opravte chyby v JSON před spuštěním kvízu.");
      setScreen("start");
      return;
    }

    try {
      const parsedQuiz = JSON.parse(validJson); // Parse the validated JSON string

      // More robust validation
      if (
        !parsedQuiz ||
        typeof parsedQuiz !== "object" ||
        !parsedQuiz.questions ||
        !Array.isArray(parsedQuiz.questions) ||
        parsedQuiz.questions.length === 0 ||
        !parsedQuiz.questions.every(
          (q) =>
            typeof q.question === "string" &&
            Array.isArray(q.answers) &&
            typeof q.correctIndex === "number",
        )
      ) {
        throw new Error(
          "Neplatný formát kvízu: zkontrolujte strukturu otázek, odpovědí a correctIndex.",
        );
      }

      // Setup the quiz state
      setQuiz(parsedQuiz); // Store the parsed object
      setCurrentQuestionIndex(0);
      setScore(0);
      setResults([]); // Clear previous results
      setScreen("question"); // Change screen
    } catch (error) {
      console.error("Error parsing JSON for starting quiz:", error);
      alert(
        `Chyba při přípravě kvízu: ${error.message}. Zkontrolujte formát JSON.`,
      );
      setJsonError(`Chyba JSON: ${error.message}`); // Show error in setup
      setScreen("start"); // Stay on setup screen
    }
  };

  // Function to replay the *current* quiz
  const replayQuiz = () => {
    if (!quiz) {
      console.error("Cannot replay, no quiz data available.");
      goToSetup(); // Go back to setup if something went wrong
      return;
    }
    // Reset progress, keep quiz data
    setCurrentQuestionIndex(0);
    setScore(0);
    setResults([]);
    setScreen("question"); // Go back to the first question
  };

  // Function to go back to the setup screen (previously resetQuiz)
  const goToSetup = () => {
    // Don't clear validJson here, allow user to save or restart the same loaded/generated quiz
    setQuiz(null); // Clear the active quiz object
    setCurrentQuestionIndex(0);
    setScore(0);
    setResults([]);
    setScreen("start"); // Go back to setup view
    // Keep validJson, jsonInput, jsonError as they are for persistence
  };

  // --- During Quiz Functions ---

  const selectAnswer = (answerIndex) => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return; // Safety check

    const question = quiz.questions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correctIndex;

    // Record result before moving on
    recordResult(isCorrect, answerIndex);

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1000); // Or your scoring logic
    }

    // Use a timeout to show feedback before moving to the next question
    // (Assuming QuizQuestion component handles visual feedback)
    setTimeout(nextQuestion, 1500); // Adjust delay as needed
  };

  const recordResult = (isCorrect, selectedAnswerIndex) => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return;
    const question = quiz.questions[currentQuestionIndex];
    setResults((prevResults) => [
      ...prevResults,
      {
        question: question.question,
        isCorrect: isCorrect,
        selectedAnswer:
          selectedAnswerIndex !== null &&
          question.answers[selectedAnswerIndex] !== undefined
            ? question.answers[selectedAnswerIndex]
            : "Neodpovězeno", // Handle skipped or invalid index
        correctAnswer: question.answers[question.correctIndex],
      },
    ]);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // End of quiz
      setScreen("results");
    }
  };

  // --- Render Logic ---

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
      <Header />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8 w-full">
        {/* Centering container */}
        <div className="w-full max-w-6xl">
          {screen === "start" && (
            <QuizSetup
              // Pass JSON state and setters down
              validJson={validJson}
              setJsonInput={setJsonInput} // Pass setters so QuizSetup can update App's state
              setValidJson={setValidJson}
              setJsonError={setJsonError}
              jsonError={jsonError}
              // Pass actions
              startQuiz={startQuiz}
            />
          )}

          {screen === "question" && quiz && (
            <QuizQuestion
              quiz={quiz} // Pass the parsed quiz object
              currentQuestionIndex={currentQuestionIndex}
              score={score}
              selectAnswer={selectAnswer}
              totalQuestions={quiz.questions.length} // Pass total for progress display
            />
          )}

          {screen === "results" && (
            <QuizResults
              score={score}
              results={results}
              replayQuiz={replayQuiz}
              goToSetup={goToSetup}
              quizTitle={quiz?.title || "Výsledky Kvízu"}
              validJson={validJson} // <-- Pass validJson here
            />
          )}
        </div>
      </main>

      {/* Footer only shown on start screen */}
      {screen === "start" && <Footer />}
    </div>
  );
};

export default App;
