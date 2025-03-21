import React, { useState, useEffect, useRef } from "react";

const QuizQuestion = ({ quiz, currentQuestionIndex, score, selectAnswer }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const timerBarRef = useRef(null);

  const startTimer = (seconds) => {
    clearTimeout(timerRef.current);
    setTimeLeft(seconds);

    if (timerBarRef.current) {
      timerBarRef.current.style.transition = "none";
      timerBarRef.current.style.width = "100%";
      void timerBarRef.current.offsetWidth; // force reflow
      timerBarRef.current.style.transition = `width ${seconds}s linear`;
      timerBarRef.current.style.width = "0%";
    }

    timerRef.current = setTimeout(() => {
      selectAnswer(null);
    }, seconds * 1000);
  };

  // Clear timers when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  // Start timer on question change
  useEffect(() => {
    if (quiz) {
      const question = quiz.questions[currentQuestionIndex];
      startTimer(question.timeLimit || 20);
    }
  }, [currentQuestionIndex, quiz]);

  return (
    <section className="flex-1 bg-white p-6 rounded-md shadow-md h-3/4">
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div className="flex justify-between text-lg font-semibold">
          <span>
            Otázka {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
          <span>Skóre: {score}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div ref={timerBarRef} className="h-full bg-red-500 w-full" />
        </div>
        <div className="text-2xl font-bold text-center my-5">
          {quiz.questions[currentQuestionIndex].question}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {quiz.questions[currentQuestionIndex].answers.map((answer, i) => (
            <div
              key={i}
              className={`p-5 text-center text-lg font-bold text-white rounded-lg cursor-pointer hover:scale-105 transition-transform ${
                ["bg-red-600", "bg-blue-600", "bg-yellow-600", "bg-green-600"][
                  i
                ]
              }`}
              onClick={() => selectAnswer(i)}
            >
              {answer}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizQuestion;
