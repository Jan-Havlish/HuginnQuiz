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
    <section className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg animate-fadeIn">
      <div className="flex flex-col gap-6 text-center">
        <h2 className="text-3xl font-bold text-yellow-600">{displayTitle}</h2>
        <p className="text-xl mt-2">Vaše konečné skóre:</p>
        <div className="text-5xl font-bold text-green-600 mb-4">{score}</div>
        <p className="text-lg mb-6">
          Správně jste odpověděli na {correctAnswers} z {totalQuestions} otázek
          ({accuracy}%).
        </p>

        {/* Action Buttons */}
        {/* Combined flex container for better responsive layout */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-8 border-t pt-6">
          <button
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 order-1 sm:order-1" // Order for mobile/desktop
            onClick={replayQuiz}
          >
            Hrát Znovu Stejný Kvíz
          </button>

          {/* Conditionally render Save Button only if validJson exists */}
          {parsedQuizData && (
            <SaveJsonButton
              data={parsedQuizData}
              filename={saveFilename}
              disabled={!parsedQuizData} // Should always be enabled if rendered, but good practice
              className="bg-green-500 hover:bg-green-600 order-3 sm:order-2" // Adjust order
            >
              Uložit Tento Kvíz {/* Specific text */}
            </SaveJsonButton>
          )}

          <button
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 order-2 sm:order-3" // Adjust order
            onClick={goToSetup}
          >
            Nový Kvíz {/* Changed text */}
          </button>
        </div>

        {/* Question Summary Title */}
        <h3 className="font-bold text-xl mt-8 border-t pt-6">
          Přehled odpovědí
        </h3>

        {/* Results List */}
        <ul className="space-y-3 text-left max-h-96 overflow-y-auto pr-2">
          {results.map((result, index) => (
            <li
              key={index}
              className={`p-4 rounded-md ${
                result.isCorrect
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "bg-red-50 border-l-4 border-red-500"
              }`}
            >
              <p className="font-semibold mb-1">
                Otázka {index + 1}: {result.question}
              </p>
              <div className="text-sm mt-1">
                {result.isCorrect ? (
                  <span className="text-green-700">
                    ✅ Správně: {result.correctAnswer}
                  </span>
                ) : (
                  <>
                    <span className="text-red-700 block">
                      ❌ Vaše odpověď: {result.selectedAnswer || "Neodpovězeno"}
                    </span>
                    <span className="text-gray-600 block">
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
