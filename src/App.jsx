import React, { useState, useEffect, useRef } from "react";
import { call } from "./ai";
import { SaveJsonButton, LoadJsonButton } from "./JsonHandling";
import Introduction from "./Introduction";

const App = () => {
  // State variables
  const [screen, setScreen] = useState("start"); // 'start', 'question', 'results'
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  // jsonInput holds the raw text, validJson holds the last successfully parsed JSON text
  const [jsonInput, setJsonInput] = useState(sampleQuizJson);
  const [validJson, setValidJson] = useState(sampleQuizJson);
  const [jsonError, setJsonError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const timerBarRef = useRef(null);

  // New state variables for the API key, topic, and number of questions
  const [apiKey, setApiKey] = useState("");
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Clear timers when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

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
      recordResult(false, null);
      nextQuestion();
    }, seconds * 1000);
  };

  const selectAnswer = (answerIndex) => {
    clearTimeout(timerRef.current);
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
    clearTimeout(timerRef.current);
  };

  // Start timer on question change
  useEffect(() => {
    if (screen === "question" && quiz) {
      const question = quiz.questions[currentQuestionIndex];
      startTimer(question.timeLimit || 20);
    }
  }, [currentQuestionIndex, screen, quiz]);

  // Generate quiz via AI
  const generateQuiz = async () => {
    if (!apiKey || !topic || !numberOfQuestions) {
      alert(
        "Please fill in your API key, quiz topic, and number of questions.",
      );
      return;
    }

    const prompt = `Hi, Create a Kahoot-style quiz in JSON format with the following structure:

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

    try {
      const response = await call(apiKey, prompt);
      console.log(response, "call in app");
      // Assume response is valid JSON; update both states
      const newJson = JSON.stringify(response, null, 2);
      setJsonInput(newJson);
      setValidJson(newJson);
      setJsonError("");
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Error generating quiz. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-yellow-500 text-white p-4 shadow-md text-center">
        <h1 className="text-3xl font-bold">HuginnQuiz</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row p-8 max-w-8xl mx-auto w-full gap-8">
        {/* Sidebar */}
        {screen === "start" && (
          <aside className="w-full lg:w-1/3 bg-white p-6 rounded-md shadow-md h-fit">
            <Introduction />
            <div className="flex flex-col gap-3">
              <input
                type="password"
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Vložte API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Zadejte téma kvízu"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <input
                type="number"
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Počet otázek"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
              />
              <button
                className="p-3 bg-yellow-300 hover:bg-yellow-400 text-zinc-700 font-bold rounded-md transition-colors"
                onClick={generateQuiz}
              >
                Vygenerovat Kvíz
              </button>
              <div className="flex m-2 justify-center gap-2">
                <SaveJsonButton
                  data={JSON.parse(validJson)}
                  filename={JSON.parse(validJson).title + ".json"}
                />
                <LoadJsonButton
                  onLoad={(data) => {
                    const newJson = JSON.stringify(data, null, 2);
                    setJsonInput(newJson);
                    setValidJson(newJson);
                    setJsonError("");
                  }}
                />
              </div>
            </div>
          </aside>
        )}

        {/* Quiz Area */}
        <section className="flex-1 bg-white p-6 rounded-md shadow-md h-3/4">
          {screen === "start" && (
            <div className="flex flex-col gap-4">
              <textarea
                className="min-h-96 p-3 font-mono border border-gray-300 rounded-md resize-y"
                value={jsonInput}
                onChange={handleJsonChange}
                placeholder="Paste your quiz JSON here..."
              />
              {jsonError && <div className="text-red-600">{jsonError}</div>}
              <button
                className="p-3 bg-yellow-300 hover:bg-yellow-500 text-zinc-700 font-bold rounded-md transition-colors"
                onClick={startQuiz}
                disabled={!!jsonError}
              >
                Spustit Kvíz
              </button>
            </div>
          )}

          {screen === "question" && quiz && (
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
                {quiz.questions[currentQuestionIndex].answers.map(
                  (answer, i) => (
                    <div
                      key={i}
                      className={`p-5 text-center text-lg font-bold text-white rounded-lg cursor-pointer hover:scale-105 transition-transform ${
                        [
                          "bg-red-600",
                          "bg-blue-600",
                          "bg-yellow-600",
                          "bg-green-600",
                        ][i]
                      }`}
                      onClick={() => selectAnswer(i)}
                    >
                      {answer}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {screen === "results" && (
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
                          ❌ Odpověděli jste:{" "}
                          {result.selectedAnswer || "Time's up!"} <br /> Správná
                          odpověď: {result.correctAnswer}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="p-3 bg-yellow-300 hover:bg-yellow-500 text-white font-bold rounded-md transition-colors mt-4"
                onClick={resetQuiz}
              >
                Hrát Znovu
              </button>
            </div>
          )}
        </section>
      </main>

      {screen === "start" && (
        <footer className="bg-white p-4 m-8 rounded-md shadow-md flex justify-center">
          <a
            href="https://havlish.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-900 mr-4"
          >
            havlis.web.app
          </a>
          <a
            href="https://github.com/Jan-Havlish/HuginnQuiz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-900"
          >
            GitHub
          </a>
        </footer>
      )}
    </div>
  );
};

// Sample quiz JSON
const sampleQuizJson = `{
  "title": "Ultimátní kvíz smíšených znalostí",
  "questions": [
    {
      "question": "Která planeta v naší sluneční soustavě má nejvíce měsíců?",
      "answers": ["Jupiter", "Saturn", "Uran", "Neptun"],
      "correctIndex": 1,
      "timeLimit": 20
    },
    {
      "question": "Jaké je hlavní město Austrálie?",
      "answers": ["Sydney", "Melbourne", "Canberra", "Perth"],
      "correctIndex": 2,
      "timeLimit": 15
    },
    {
      "question": "Ve kterém roce byl vydán první iPhone?",
      "answers": ["2005", "2006", "2007", "2008"],
      "correctIndex": 2,
      "timeLimit": 15
    },
    {
      "question": "Který prvek má chemický symbol 'Au'?",
      "answers": ["Stříbro", "Zlato", "Hliník", "Argon"],
      "correctIndex": 1,
      "timeLimit": 10
    },
    {
      "question": "Jaký je největší druh žraloka?",
      "answers": ["Žralok bílý", "Žralok obrovský", "Žralok tygří", "Kladivoun"],
      "correctIndex": 1,
      "timeLimit": 15
    }
  ]
}`;

export default App;
