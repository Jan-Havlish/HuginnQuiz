import React, { useState, useEffect } from "react";
import { get, set } from "idb-keyval";
import { call } from "../ai"; // Assuming correct path
import { SaveJsonButton, LoadJsonButton } from "./JsonHandling"; // Assuming correct path
import buildQuizPrompt from "../buildPromt"; // Assuming correct path

// --- Storage Keys --- (Keep as is)
const STORAGE_KEYS = {
  API_KEY: "quizApp-apiKey",
  API_CHOICE: "quizApp-apiChoice",
  NUM_QUESTIONS: "quizApp-numQuestions",
  ENABLE_POPUP: "quizApp-enablePopup",
  SHOW_SETTINGS: "quizApp-showSettings",
};

// --- Simple Modal Component (Keep as is) ---
const Modal = ({ show, onClose, children }) => {
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
  const [showSettings, setShowSettings] = useState(false);
  const [shouldStartQuiz, setShouldStartQuiz] = useState(false);
  const [enableReadyPopup, setEnableReadyPopup] = useState(false);
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [quizDataForPopup, setQuizDataForPopup] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // --- NEW: State for Introduction Tabs within Settings ---
  const [activeInfoTab, setActiveInfoTab] = useState(0);

  // --- Effect to Load Settings on Mount ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [
          storedApiKey,
          storedApiChoice,
          storedNumQuestions,
          storedEnablePopup,
          storedShowSettings,
        ] = await Promise.all([
          get(STORAGE_KEYS.API_KEY),
          get(STORAGE_KEYS.API_CHOICE),
          get(STORAGE_KEYS.NUM_QUESTIONS),
          get(STORAGE_KEYS.ENABLE_POPUP),
          get(STORAGE_KEYS.SHOW_SETTINGS),
        ]);

        // Load settings (as before)
        if (storedApiKey !== undefined) setApiKey(storedApiKey);
        if (storedApiChoice === "own" || storedApiChoice === "cloud")
          setApiChoice(storedApiChoice);
        if (
          typeof storedNumQuestions === "number" &&
          storedNumQuestions >= 1 &&
          storedNumQuestions <= 20
        )
          setNumberOfQuestions(storedNumQuestions);
        if (typeof storedEnablePopup === "boolean")
          setEnableReadyPopup(storedEnablePopup);
        // Load showSettings state - default to false if not found
        setShowSettings(!!storedShowSettings);
      } catch (error) {
        console.error("Failed to load settings from IndexedDB:", error);
        // Don't halt execution, just use defaults
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []); // Runs only once on mount

  // --- Effects to Save Settings on Change ---
  useEffect(() => {
    if (settingsLoaded) {
      set(STORAGE_KEYS.API_KEY, apiKey).catch((err) =>
        console.error("Failed to save API key:", err),
      );
    }
  }, [apiKey, settingsLoaded]);

  useEffect(() => {
    if (settingsLoaded) {
      set(STORAGE_KEYS.API_CHOICE, apiChoice).catch((err) =>
        console.error("Failed to save API choice:", err),
      );
    }
  }, [apiChoice, settingsLoaded]);

  useEffect(() => {
    if (
      settingsLoaded &&
      typeof numberOfQuestions === "number" &&
      numberOfQuestions >= 1
    ) {
      set(STORAGE_KEYS.NUM_QUESTIONS, numberOfQuestions).catch((err) =>
        console.error("Failed to save number of questions:", err),
      );
    }
  }, [numberOfQuestions, settingsLoaded]);

  useEffect(() => {
    if (settingsLoaded) {
      set(STORAGE_KEYS.ENABLE_POPUP, enableReadyPopup).catch((err) =>
        console.error("Failed to save enable popup setting:", err),
      );
    }
  }, [enableReadyPopup, settingsLoaded]);

  useEffect(() => {
    if (settingsLoaded) {
      set(STORAGE_KEYS.SHOW_SETTINGS, showSettings).catch((err) =>
        console.error("Failed to save show settings state:", err),
      );
    }
  }, [showSettings, settingsLoaded]);

  // --- Existing Effects and Helper Functions (Unchanged) ---
  useEffect(() => {
    if (shouldStartQuiz && validJson) {
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
    try {
      const parsedData = JSON.parse(newJsonString);
      setJsonInput(newJsonString); // Passed from parent
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
        // Cloud function call
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
    if (
      e.key === "Enter" &&
      !isLoading &&
      topic &&
      e.target.tagName.toLowerCase() === "input" &&
      e.target.type === "text"
    ) {
      // Prevent triggering generation if Enter is pressed inside settings panel inputs
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

  // --- NEW: Constants for Info Tab styling ---
  const tabButtonBase =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1";
  const tabButtonInactive = "bg-gray-200 text-gray-600 hover:bg-gray-300";
  const tabButtonActive = "bg-yellow-400 text-gray-800"; // Use darker text on yellow bg

  // --- JSX ---
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      {/* --- Ready Popup Modal (Unchanged) --- */}
      <Modal show={showReadyPopup} onClose={handlePopupClose}>
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
            Uložit Kvíz
          </SaveJsonButton>
          <button
            onClick={handlePopupStart}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Spustit Nyní
          </button>
          <button
            onClick={handlePopupClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75"
          >
            Zavřít
          </button>
        </div>
      </Modal>
      {/* --- End Ready Popup Modal --- */}

      <div className="w-full text-center my-8">
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
            onClick={() => setShowSettings((prevShow) => !prevShow)}
            title="Nastavení a Nápověda" // Updated title
            disabled={isLoading}
          >
            {/* SVG Icon (Gear) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="settings-panel mt-3 p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl border border-gray-200">
            {/* --- START: Integrated Introduction/Help Section --- */}
            <div className="mb-6">
              {" "}
              {/* Add margin below the help section */}
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Nastavení a Nápověda
              </h3>
              {/* Tabs Container */}
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
                <button
                  className={`${tabButtonBase} ${activeInfoTab === 0 ? tabButtonActive : tabButtonInactive}`}
                  onClick={() => setActiveInfoTab(0)}
                >
                  Úvod & JSON
                </button>
                <button
                  className={`${tabButtonBase} ${activeInfoTab === 1 ? tabButtonActive : tabButtonInactive}`}
                  onClick={() => setActiveInfoTab(1)}
                >
                  Použití
                </button>
                {/* Removed the specific API tab as settings are below */}
              </div>
              {/* Tab Content */}
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                {/* Tab: Úvod & JSON Structure */}
                {activeInfoTab === 0 && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-800">
                      Vítejte v Quiz Generatoru!
                    </p>
                    <p>
                      Můžete buď načíst existující kvíz (JSON soubor) nebo
                      nechat AI vygenerovat nový na základě zadaného tématu
                      níže.
                    </p>
                    <p>Požadovaná struktura JSON souboru:</p>
                    <pre className="bg-gray-200 p-3 rounded-md text-xs text-gray-800 overflow-x-auto">
                      {`{
  "title": "Název Kvízu",
  "questions": [
    {
      "question": "Text otázky?",
      "answers": ["Odpověď A", "Odpověď B", "Odpověď C"],
      "correctIndex": 0, // Index správné odpovědi (od 0)
      "timeLimit": 30 // Volitelné (sekundy, výchozí 20)
    },
    // ... další otázky ...
  ]
}`}
                    </pre>
                  </div>
                )}

                {/* Tab: Usage */}
                {activeInfoTab === 1 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">
                      Jak to použít:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 pl-2">
                      <li>
                        <b>Pro generování AI kvízu:</b>
                        <ul className="list-disc list-inside pl-4 space-y-1 mt-1">
                          <li>Zadejte téma do hlavního pole.</li>
                          <li>
                            Vyberte zdroj API (cloudové je jednodušší, vlastní
                            vyžaduje váš klíč).{" "}
                            {/* Link integrated into settings now */}
                            {apiChoice === "own" && (
                              <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 ml-1"
                              >
                                Získat klíč
                              </a>
                            )}
                          </li>
                          <li>Nastavte počet otázek.</li>
                          <li>
                            Klikněte na{" "}
                            <span className="font-mono bg-gray-200 px-1 rounded">
                              Vygenerovat Kvíz
                            </span>
                            .
                          </li>
                        </ul>
                      </li>
                      <li className="mt-2">
                        <b>Pro načtení vlastního kvízu:</b>
                        <ul className="list-disc list-inside pl-4 space-y-1 mt-1">
                          <li>
                            Použijte tlačítko{" "}
                            <span className="font-mono bg-gray-200 px-1 rounded">
                              📂 Načíst JSON
                            </span>{" "}
                            v sekci "Správa souborů".
                          </li>
                          <li>Vyberte váš `.json` soubor.</li>
                          <li>
                            Po načtení můžete kvíz spustit nebo uložit pomocí{" "}
                            <span className="font-mono bg-gray-200 px-1 rounded">
                              💾 Uložit JSON
                            </span>
                            .
                          </li>
                        </ul>
                      </li>
                    </ol>
                    <p className="text-xs italic text-gray-600 mt-2">
                      Pozn.: Cloudové API má limity. Vlastní klíč je uložen jen
                      ve vašem prohlížeči.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* --- END: Integrated Introduction/Help Section --- */}

            {/* --- START: Original Settings Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: API & Options */}
              <div className="flex flex-col gap-4">
                <fieldset>
                  <legend className="font-semibold text-gray-700 mb-2">
                    Zdroj API klíče:
                  </legend>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="apiChoice"
                        value="cloud"
                        checked={apiChoice === "cloud"}
                        onChange={() => setApiChoice("cloud")}
                        className="form-radio h-4 w-4 text-yellow-500"
                      />
                      Použít cloudový (doporučeno)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="apiChoice"
                        value="own"
                        checked={apiChoice === "own"}
                        onChange={() => setApiChoice("own")}
                        className="form-radio h-4 w-4 text-yellow-500"
                      />
                      Použít vlastní
                    </label>
                    {apiChoice === "own" && (
                      <>
                        <input
                          type="password"
                          className="p-2 mt-1 border border-gray-300 rounded-md w-full focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Váš Google AI API klíč..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        {/* Link moved to help text above */}
                        <p className="text-xs text-orange-600 mt-1">
                          Upozornění: Váš klíč bude uložen lokálně v prohlížeči.
                        </p>
                      </>
                    )}
                  </div>
                </fieldset>
                <div>
                  <label
                    htmlFor="question-count"
                    className="font-semibold text-gray-700 mb-1 block"
                  >
                    Počet otázek (pro AI):
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
                        setNumberOfQuestions(5); // Default back to 5 if invalid
                      } else if (val > 20) {
                        setNumberOfQuestions(20); // Cap at 20
                      }
                    }}
                    min="1"
                    max="20"
                    placeholder="1-20"
                  />
                </div>
                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableReadyPopup}
                      onChange={(e) => setEnableReadyPopup(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-yellow-500 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      Zobrazit potvrzení před startem
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Umožní uložit kvíz před spuštěním.
                  </p>
                </div>
              </div>

              {/* Column 2: File Handling & Errors */}
              <div className="flex flex-col gap-4">
                <span className="font-semibold text-gray-700 mb-1">
                  Správa souborů:
                </span>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <LoadJsonButton
                    onLoad={handleLoadJson}
                    disabled={isLoading}
                  />
                  {currentParsedData && (
                    <SaveJsonButton
                      data={currentParsedData}
                      filename={currentFilename}
                      disabled={!currentParsedData || isLoading}
                    />
                  )}
                </div>
                {jsonError && (
                  <p className="text-red-600 text-sm mt-2 bg-red-100 p-2 rounded border border-red-300">
                    {jsonError}
                  </p>
                )}
              </div>
            </div>
            {/* --- END: Original Settings Grid --- */}
          </div>
        )}
        {/* End Settings dropdown */}
      </div>

      {/* Generate button (Unchanged) */}
      <button
        className={`px-8 py-3 mb-6 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"} text-white font-bold rounded-full text-lg shadow-md transition-colors w-64`}
        onClick={generateQuiz}
        disabled={
          isLoading ||
          !topic ||
          (apiChoice === "own" && !apiKey) ||
          typeof numberOfQuestions !== "number" || // Ensure it's a number
          numberOfQuestions < 1 // Ensure it's at least 1
        }
      >
        {isLoading ? "Generuji..." : "Vygenerovat Kvíz"}
      </button>

      {/* Introduction section is now removed from here */}
      {/* {!showSettings && ( ... )} */}
    </div>
  );
};

export default QuizSetup;
