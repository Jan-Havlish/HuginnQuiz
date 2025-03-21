import React, { useState } from "react";
import { call } from "../ai";
import { SaveJsonButton, LoadJsonButton } from "./JsonHandling";
import Introduction from "./Introduction";
import buildQuizPrompt from "../buildPromt";

const QuizSetup = ({
  jsonInput,
  handleJsonChange,
  jsonError,
  startQuiz,
  validJson,
  setJsonInput,
  setValidJson,
  setJsonError,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [apiChoice, setApiChoice] = useState("own"); // "own" or "cloud"
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Generate quiz via AI using the Netlify Function
  const generateQuiz = async () => {
    // Check: if own API is chosen, it must be filled; for cloud choice it doesn't have to be.
    if (apiChoice === "own" && !apiKey) {
      alert("Prosím, vložte svůj API key.");
      return;
    }
    if (!topic || !numberOfQuestions) {
      alert("Prosím, vyplňte téma kvízu a počet otázek.");
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (apiChoice === "own") {
        // Use client-side approach only for users with their own API key
        response = await call(
          apiKey,
          buildQuizPrompt(topic, numberOfQuestions),
        );
      } else {
        // For server-side approach, only send the required parameters, not the full prompt
        const res = await fetch("/.netlify/functions/call", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quizTopic: topic,
            questionCount: numberOfQuestions,
            // No prompt is sent - server will generate it
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Server error");
        }

        response = await res.json();
      }

      const newJson = JSON.stringify(response, null, 2);
      setJsonInput(newJson);
      setValidJson(newJson);
      setJsonError("");
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(`Error generating quiz: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <aside className="w-full lg:w-1/3 bg-white p-6 rounded-md shadow-md h-fit">
        <Introduction />
        <div className="flex flex-col gap-3">
          {/* API key selection */}
          <div className="flex flex-col gap-2">
            <span className="font-bold">Vyberte API klíč:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="apiChoice"
                value="own"
                checked={apiChoice === "own"}
                onChange={() => setApiChoice("own")}
              />
              Použít vlastní API klíč
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="apiChoice"
                value="cloud"
                checked={apiChoice === "cloud"}
                onChange={() => setApiChoice("cloud")}
              />
              Použít cloudový API klíč
            </label>
          </div>

          {/* If own API key is chosen, show input */}
          {apiChoice === "own" && (
            <input
              type="password"
              className="p-2 border border-gray-300 rounded-md"
              placeholder="Vložte API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
          {apiChoice === "cloud" && (
            <div className="p-2 border border-gray-300 rounded-md text-gray-600">
              Použije se cloudový API klíč (omezený počet dotazů).
            </div>
          )}

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
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            min="1"
            max="20"
          />
          <button
            className={`p-3 ${isLoading ? "bg-gray-400" : "bg-yellow-300 hover:bg-yellow-400"} text-zinc-700 font-bold rounded-md transition-colors`}
            onClick={generateQuiz}
            disabled={isLoading}
          >
            {isLoading ? "Generuji..." : "Vygenerovat Kvíz"}
          </button>
          <div className="flex m-2 justify-center gap-2">
            <SaveJsonButton
              data={validJson ? JSON.parse(validJson) : {}}
              filename={
                validJson
                  ? (JSON.parse(validJson).title || "quiz") + ".json"
                  : "quiz.json"
              }
              disabled={!validJson}
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

      <section className="flex-1 bg-white p-6 rounded-md shadow-md h-3/4">
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
            disabled={!!jsonError || isLoading}
          >
            Spustit Kvíz
          </button>
        </div>
      </section>
    </>
  );
};

export default QuizSetup;
