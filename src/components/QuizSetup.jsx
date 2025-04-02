import React, { useState, useEffect } from "react";
import { get, set } from "idb-keyval"; // Already imported
import { call } from "../ai";
import { SaveJsonButton, LoadJsonButton } from "./JsonHandling";
import Introduction from "./Introduction";
import buildQuizPrompt from "../buildPromt";

// --- Storage Keys --- (Add key for showSettings)
const STORAGE_KEYS = {
  API_KEY: "quizApp-apiKey",
  API_CHOICE: "quizApp-apiChoice",
  NUM_QUESTIONS: "quizApp-numQuestions",
  ENABLE_POPUP: "quizApp-enablePopup",
  SHOW_SETTINGS: "quizApp-showSettings", // <-- New key
};

// --- Simple Modal Component (Keep as is) ---
const Modal = ({ show, onClose, children }) => {
  // ... (Modal code remains the same)
  if (!show) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        {children}
      </div>
    </div>
  );
};
// --- End Modal Component ---

const QuizSetup = ({
  jsonError,
  startQuiz,
  validJson,
  setJsonInput,
  setValidJson,
  setJsonError,
}) => {
  // --- State variables ---
  const [apiKey, setApiKey] = useState("");
  const [apiChoice, setApiChoice] = useState("cloud");
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize showSettings with default false, loading effect will override
  const [showSettings, setShowSettings] = useState(false); // <-- Still needed
  const [shouldStartQuiz, setShouldStartQuiz] = useState(false);
  const [enableReadyPopup, setEnableReadyPopup] = useState(false);
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [quizDataForPopup, setQuizDataForPopup] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // --- Effect to Load Settings on Mount ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Add SHOW_SETTINGS to the Promise.all
        const [
          storedApiKey,
          storedApiChoice,
          storedNumQuestions,
          storedEnablePopup,
          storedShowSettings, // <-- Get the stored value
        ] = await Promise.all([
          get(STORAGE_KEYS.API_KEY),
          get(STORAGE_KEYS.API_CHOICE),
          get(STORAGE_KEYS.NUM_QUESTIONS),
          get(STORAGE_KEYS.ENABLE_POPUP),
          get(STORAGE_KEYS.SHOW_SETTINGS), // <-- Fetch the key
        ]);

        // Load other settings (as before)
        if (storedApiKey !== undefined) {
          console.log(
            "Loading stored API Key (masked length):",
            storedApiKey?.length,
          );
          setApiKey(storedApiKey);
        }
        if (storedApiChoice === "own" || storedApiChoice === "cloud") {
          console.log("Loading stored API Choice:", storedApiChoice);
          setApiChoice(storedApiChoice);
        }
        if (
          typeof storedNumQuestions === "number" &&
          storedNumQuestions >= 1 &&
          storedNumQuestions <= 20
        ) {
          console.log(
            "Loading stored Number of Questions:",
            storedNumQuestions,
          );
          setNumberOfQuestions(storedNumQuestions);
        }
        if (typeof storedEnablePopup === "boolean") {
          console.log("Loading stored Enable Popup:", storedEnablePopup);
          setEnableReadyPopup(storedEnablePopup);
        }
        // Load showSettings state
        if (typeof storedShowSettings === "boolean") {
          // <-- Check if boolean exists
          console.log("Loading stored Show Settings:", storedShowSettings);
          setShowSettings(storedShowSettings); // <-- Update state
        }
      } catch (error) {
        console.error("Failed to load settings from IndexedDB:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []); // Runs only once on mount

  // --- Effects to Save Settings on Change ---

  // Save API Key (as before)
  useEffect(() => {
    if (settingsLoaded) {
      console.log(
        "Attempting to save API Key (masked length):",
        apiKey?.length,
      );
      set(STORAGE_KEYS.API_KEY, apiKey).catch((err) =>
        console.error("Failed to save API key:", err),
      );
    }
  }, [apiKey, settingsLoaded]);

  // Save API Choice (as before)
  useEffect(() => {
    if (settingsLoaded) {
      console.log("Saving API Choice:", apiChoice);
      set(STORAGE_KEYS.API_CHOICE, apiChoice).catch((err) =>
        console.error("Failed to save API choice:", err),
      );
    }
  }, [apiChoice, settingsLoaded]);

  // Save Number of Questions (as before)
  useEffect(() => {
    if (
      settingsLoaded &&
      typeof numberOfQuestions === "number" &&
      numberOfQuestions >= 1
    ) {
      console.log("Saving Number of Questions:", numberOfQuestions);
      set(STORAGE_KEYS.NUM_QUESTIONS, numberOfQuestions).catch((err) =>
        console.error("Failed to save number of questions:", err),
      );
    }
  }, [numberOfQuestions, settingsLoaded]);

  // Save Enable Ready Popup preference (as before)
  useEffect(() => {
    if (settingsLoaded) {
      console.log("Saving Enable Popup:", enableReadyPopup);
      set(STORAGE_KEYS.ENABLE_POPUP, enableReadyPopup).catch((err) =>
        console.error("Failed to save enable popup setting:", err),
      );
    }
  }, [enableReadyPopup, settingsLoaded]);

  // --- NEW Effect: Save Show Settings state ---
  useEffect(() => {
    // Only save after initial settings have been loaded
    if (settingsLoaded) {
      console.log("Saving Show Settings:", showSettings);
      set(STORAGE_KEYS.SHOW_SETTINGS, showSettings) // Save the boolean value
        .catch((err) =>
          console.error("Failed to save show settings state:", err),
        );
    }
  }, [showSettings, settingsLoaded]); // Depend on showSettings and settingsLoaded

  // --- Existing Effects and Functions (Unchanged) ---

  useEffect(() => {
    if (shouldStartQuiz && validJson) {
      console.log("useEffect triggering startQuiz with validJson");
      startQuiz();
      setShouldStartQuiz(false);
    }
  }, [shouldStartQuiz, validJson, startQuiz]);

  const getParsedJsonData = () => {
    if (!validJson) return null;
    try {
      return JSON.parse(validJson);
    } catch (e) {
      console.error("Error parsing validJson for use:", e);
      return null;
    }
  };

  const getFilename = (parsedData) => {
    if (!parsedData) return "quiz.json";
    const safeTitle = parsedData.title
      ? String(parsedData.title)
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()
      : "quiz";
    return `${safeTitle}_${parsedData.questions?.length || 0}q.json`;
  };

  const handleQuizReady = (newJsonString) => {
    // ... (function remains the same)
    try {
      const parsedData = JSON.parse(newJsonString);
      setJsonInput(newJsonString); // Note: setJsonInput was passed from App in original
      setValidJson(newJsonString);
      setJsonError("");
      setQuizDataForPopup(parsedData);

      if (enableReadyPopup) {
        setShowReadyPopup(true);
        setShouldStartQuiz(false);
      } else {
        setShouldStartQuiz(true);
        setShowReadyPopup(false);
      }
    } catch (error) {
      console.error("Error processing generated/loaded JSON:", error);
      const errorMsg = `Chyba při zpracování JSON: ${error.message}`;
      alert(errorMsg);
      setJsonError(errorMsg);
      setValidJson(null);
      setQuizDataForPopup(null);
      setShowReadyPopup(false);
    }
  };

  const generateQuiz = async () => {
    // ... (function remains the same)
    if (apiChoice === "own" && !apiKey) {
      alert("Prosím, vložte svůj API key.");
      return;
    }
    if (!topic) {
      alert("Prosím, vyplňte téma kvízu.");
      return;
    }
    setIsLoading(true);
    setShowReadyPopup(false);
    setShouldStartQuiz(false);
    try {
      let responseJson;
      if (apiChoice === "own") {
        responseJson = await call(
          apiKey,
          buildQuizPrompt(topic, numberOfQuestions),
        );
      } else {
        const res = await fetch("/.netlify/functions/call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizTopic: topic,
            questionCount: numberOfQuestions,
          }),
        });
        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
          } catch (e) {
            errorData = {
              error: (await res.text()) || `Server error: ${res.status}`,
            };
          }
          throw new Error(errorData.error || `Server error: ${res.status}`);
        }
        responseJson = await res.json();
      }
      if (
        !responseJson ||
        !Array.isArray(responseJson.questions) ||
        responseJson.questions.length === 0
      ) {
        throw new Error("Generovaná data nemají očekávaný formát kvízu.");
      }
      const newJsonString = JSON.stringify(responseJson, null, 2);
      handleQuizReady(newJsonString);
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage = error.message || "Neznámá chyba při generování.";
      alert(`Chyba při generování kvízu: ${errorMessage}`);
      setJsonError(`Chyba: ${errorMessage}`);
      setValidJson(null);
      setQuizDataForPopup(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadJson = (loadedData) => {
    // ... (function remains the same)
    try {
      if (
        !loadedData ||
        !Array.isArray(loadedData.questions) ||
        loadedData.questions.length === 0
      ) {
        throw new Error("Nahraný soubor nemá očekávaný formát kvízu.");
      }
      const newJsonString = JSON.stringify(loadedData, null, 2);
      handleQuizReady(newJsonString);
    } catch (error) {
      console.error("Error processing loaded JSON:", error);
      const errorMsg = `Chyba při zpracování nahraného JSON: ${error.message}`;
      alert(errorMsg);
      setJsonError(errorMsg);
      setValidJson(null);
      setQuizDataForPopup(null);
    }
  };

  const handleKeyPress = (e) => {
    // ... (function remains the same)
    if (
      e.key === "Enter" &&
      !isLoading &&
      topic &&
      e.target.tagName.toLowerCase() === "input" &&
      e.target.type === "text"
    ) {
      if (!e.target.closest(".settings-panel")) {
        generateQuiz();
      }
    }
  };

  const handlePopupStart = () => {
    setShowReadyPopup(false);
    setShouldStartQuiz(true);
  };
  const handlePopupClose = () => {
    setShowReadyPopup(false);
  };

  const currentParsedData = getParsedJsonData();
  const currentFilename = getFilename(currentParsedData);

  // --- JSX (Mostly unchanged, button onClick toggles state, render depends on state) ---
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      {/* --- Ready Popup Modal (Unchanged) --- */}
      <Modal show={showReadyPopup} onClose={handlePopupClose}>
        {/* ... Modal content remains the same ... */}
        <h3 className="text-xl font-semibold mb-4 text-center">
          Kvíz je připraven!
        </h3>
        <p className="text-center mb-6">Co chcete udělat dál?</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <SaveJsonButton
            data={quizDataForPopup}
            filename={getFilename(quizDataForPopup)}
            disabled={!quizDataForPopup}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {" "}
            Uložit Kvíz{" "}
          </SaveJsonButton>
          <button
            onClick={handlePopupStart}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            {" "}
            Spustit Nyní{" "}
          </button>
          <button
            onClick={handlePopupClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75"
          >
            {" "}
            Zavřít{" "}
          </button>
        </div>
      </Modal>
      {/* --- End Ready Popup Modal --- */}

      <div className="w-full text-center my-8">
        <h1 className="text-4xl font-bold text-yellow-500 mb-4">
          Quiz Generator
        </h1>
        <p className="text-gray-600 mb-8">
          Vytvořte vlastní kvíz na jakékoli téma během okamžiku
        </p>
      </div>

      {/* Search-like main input */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            className="w-full p-4 pl-5 pr-16 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-yellow-500 shadow-md"
            placeholder="Zadejte téma kvízu..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:bg-gray-400"
            // onClick just toggles the state. The save effect handles persistence.
            onClick={() => setShowSettings((prevShow) => !prevShow)}
            title="Nastavení"
            disabled={isLoading}
          >
            {/* SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {" "}
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />{" "}
            </svg>
          </button>
        </div>

        {/* Settings dropdown - Render depends on showSettings state */}
        {showSettings && ( // <-- Conditional rendering uses the state
          <div className="settings-panel mt-3 p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl border border-gray-200">
            {/* ... Settings content remains the same ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Column 1: API & Options --- */}
              <div className="flex flex-col gap-4">
                <fieldset>
                  <legend className="font-semibold text-gray-700 mb-2">
                    {" "}
                    Zdroj API klíče:{" "}
                  </legend>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      {" "}
                      <input
                        type="radio"
                        name="apiChoice"
                        value="cloud"
                        checked={apiChoice === "cloud"}
                        onChange={() => setApiChoice("cloud")}
                        className="form-radio h-4 w-4 text-yellow-500"
                      />{" "}
                      Použít cloudový (doporučeno){" "}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      {" "}
                      <input
                        type="radio"
                        name="apiChoice"
                        value="own"
                        checked={apiChoice === "own"}
                        onChange={() => setApiChoice("own")}
                        className="form-radio h-4 w-4 text-yellow-500"
                      />{" "}
                      Použít vlastní{" "}
                    </label>
                    {apiChoice === "own" && (
                      <>
                        {" "}
                        <input
                          type="password"
                          className="p-2 mt-1 border border-gray-300 rounded-md w-full focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Váš API klíč..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />{" "}
                        <p className="text-xs text-orange-600 mt-1">
                          {" "}
                          Upozornění: Váš klíč bude uložen lokálně v
                          prohlížeči.{" "}
                        </p>{" "}
                      </>
                    )}
                  </div>
                </fieldset>
                <div>
                  <label
                    htmlFor="question-count"
                    className="font-semibold text-gray-700 mb-1 block"
                  >
                    {" "}
                    Počet otázek:{" "}
                  </label>
                  <input
                    id="question-count"
                    type="number"
                    className="p-2 border border-gray-300 rounded-md w-full focus:ring-yellow-500 focus:border-yellow-500"
                    value={numberOfQuestions}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (
                        e.target.value === "" ||
                        (!isNaN(val) && val >= 1 && val <= 20)
                      ) {
                        setNumberOfQuestions(e.target.value === "" ? "" : val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (e.target.value === "" || isNaN(val) || val < 1) {
                        setNumberOfQuestions(5);
                      } else if (val > 20) {
                        setNumberOfQuestions(20);
                      }
                    }}
                    min="1"
                    max="20"
                    placeholder="1-20"
                  />
                </div>
                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    {" "}
                    <input
                      type="checkbox"
                      checked={enableReadyPopup}
                      onChange={(e) => setEnableReadyPopup(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-yellow-500 rounded"
                    />{" "}
                    <span className="text-sm text-gray-600">
                      {" "}
                      Zobrazit potvrzení před startem{" "}
                    </span>{" "}
                  </label>{" "}
                  <p className="text-xs text-gray-500 mt-1">
                    {" "}
                    Umožní uložit kvíz před spuštěním.{" "}
                  </p>
                </div>
              </div>
              {/* --- Column 2: File Handling & Errors --- */}
              <div className="flex flex-col gap-4">
                <span className="font-semibold text-gray-700 mb-1">
                  {" "}
                  Správa souborů:{" "}
                </span>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  {" "}
                  <LoadJsonButton
                    onLoad={handleLoadJson}
                    disabled={isLoading}
                  />{" "}
                  {currentParsedData && (
                    <SaveJsonButton
                      data={currentParsedData}
                      filename={currentFilename}
                      disabled={!currentParsedData || isLoading}
                    />
                  )}{" "}
                </div>
                {jsonError && (
                  <p className="text-red-600 text-sm mt-2 bg-red-100 p-2 rounded border border-red-300">
                    {" "}
                    {jsonError}{" "}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate button (Unchanged) */}
      <button
        className={`px-8 py-3 mb-6 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"} text-white font-bold rounded-full text-lg shadow-md transition-colors w-64`}
        onClick={generateQuiz}
        disabled={
          isLoading ||
          !topic ||
          (apiChoice === "own" && !apiKey) ||
          typeof numberOfQuestions !== "number" ||
          numberOfQuestions < 1
        }
      >
        {isLoading ? "Generuji..." : "Vygenerovat Kvíz"}
      </button>

      {/* Introduction section (Unchanged) */}
      {!showSettings && (
        <div className="mt-12 w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
          <Introduction />
        </div>
      )}
    </div>
  );
};

export default QuizSetup;
