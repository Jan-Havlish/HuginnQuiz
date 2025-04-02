import React from "react";
import { SaveJsonButton } from "./JsonHandling"; // Import the SaveJsonButton

// Helper function to parse validJson safely (can be reused or imported from a utils file)
const getParsedJsonData = (jsonString) => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing validJson for saving:", e);
    return null; // Return null if parsing fails
  }
};

// Helper function to generate filename (can be reused or imported)
const getFilename = (parsedData) => {
  if (!parsedData) return "quiz_results.json"; // Default filename from results screen
  const safeTitle = parsedData.title
    ? String(parsedData.title)
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()
    : "quiz";
  const questionCount = parsedData.questions?.length || 0;
  return `${safeTitle}_${questionCount}q_results.json`; // Add suffix indicating it's saved from results
};

// Updated props: score, results, replayQuiz, goToSetup, quizTitle, validJson
const QuizResults = ({
  score,
  results,
  replayQuiz,
  goToSetup,
  quizTitle,
  validJson,
}) => {
  // Calculate statistics
  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  // Determine the title to display
  const displayTitle = quizTitle || "Kvíz dokončen!";

  // Prepare data for saving
  const parsedQuizData = getParsedJsonData(validJson);
  const saveFilename = getFilename(parsedQuizData);

  return (
    <section className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg animate-fadeIn border border-gray-200">
      <div className="flex flex-col gap-6 text-center">
        <h2 className="text-3xl font-bold text-yellow-600">{displayTitle}</h2>
        <p className="text-xl">Vaše konečné skóre:</p>
        <div className="text-5xl font-bold text-green-600">{score}</div>
        <p className="text-lg">
          Správně jste odpověděli na {correctAnswers} z {totalQuestions} otázek
          ({accuracy}%).
        </p>

        {/* --- Action Buttons --- */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-8 border-t border-gray-200 pt-6">
          <button
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 order-1 sm:order-1"
            onClick={replayQuiz}
          >
            Hrát Znovu Stejný Kvíz
          </button>

          {/* Conditionally render Save Button */}
          {parsedQuizData && (
            <SaveJsonButton
              data={parsedQuizData}
              filename={saveFilename}
              disabled={!parsedQuizData}
            />
          )}

          <button
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 order-2 sm:order-3"
            onClick={goToSetup}
          >
            Vytvořit Nový Kvíz
          </button>
        </div>

        {/* --- Question Summary Title --- */}
        <h3 className="font-bold text-xl mt-8 border-t border-gray-200 pt-6">
          Přehled odpovědí
        </h3>

        {/* --- Results List (Mapped in React) --- */}
        <ul className="space-y-4 text-left max-h-96 overflow-y-auto pr-2">
          {results.map((result, index) => (
            <li
              key={index}
              className={`p-4 rounded-md border-l-4 ${
                result.isCorrect
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <p className="font-semibold text-gray-800 mb-1">
                Otázka {index + 1}: {result.question}
              </p>
              <div className="text-sm mt-1 space-y-1">
                {result.isCorrect ? (
                  <span className="text-green-700 flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 inline"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Správně: {result.correctAnswer}
                  </span>
                ) : (
                  <>
                    <span className="text-red-700 block flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Vaše odpověď: {result.selectedAnswer || "Neodpovězeno"}
                    </span>
                    <span className="text-gray-600 block pl-6">
                      Správná odpověď: {result.correctAnswer}
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default QuizResults;
