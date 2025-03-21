import React from "react";

const QuizResults = ({ score, results, resetQuiz }) => {
  return (
    <section className="flex-1 bg-white p-6 rounded-md shadow-md h-3/4">
      <div className="flex flex-col gap-6 animate-fadeIn text-center">
        <h2 className="text-2xl font-bold">Kvíz dokončen!</h2>
        <div className="text-5xl font-bold text-yellow-800">{score}</div>
        <h3 className="font-bold text-lg mt-4">Question Summary</h3>
        <ul className="space-y-3">
          {results.map((result, index) => (
            <li
              key={index}
              className={`p-4 rounded-md text-left ${
                result.isCorrect
                  ? "bg-green-100 border-l-4 border-green-500"
                  : "bg-red-100 border-l-4 border-red-500"
              }`}
            >
              <strong>Q{index + 1}:</strong> {result.question}
              <div className="font-bold mt-1">
                {result.isCorrect ? (
                  <span>✅ Správně: {result.correctAnswer}</span>
                ) : (
                  <span>
                    ❌ Odpověděli jste: {result.selectedAnswer || "Time's up!"}{" "}
                    <br /> Správná odpověď: {result.correctAnswer}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <button
          className="p-3 bg-yellow-300 hover:bg-yellow-500 text-zinc-700 font-bold rounded-md transition-colors mt-4"
          onClick={resetQuiz}
        >
          Hrát Znovu
        </button>
      </div>
    </section>
  );
};

export default QuizResults;
