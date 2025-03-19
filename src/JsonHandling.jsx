import React, { useRef, useState } from "react";

// Component to save an object as a JSON file
export const SaveJsonButton = ({ data, filename = "data.json" }) => {
  const [saveError, setSaveError] = useState(null);

  const saveFile = () => {
    try {
      // Validate data is a valid object before saving
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data for saving");
      }

      // Create a formatted JSON string
      const jsonString = JSON.stringify(data, null, 2);

      // Create a blob and download it
      const blob = new Blob([jsonString], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename || "quiz.json";
      link.click();

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);

      setSaveError(null);
    } catch (error) {
      console.error("Error saving JSON:", error);
      setSaveError(error.message);
    }
  };

  return (
    <div>
      <button
        onClick={saveFile}
        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        disabled={saveError !== null}
      >
        Uložit
      </button>
      {saveError && (
        <div className="text-red-500 text-sm mt-1">{saveError}</div>
      )}
    </div>
  );
};

// Component to load an object from a JSON file
export const LoadJsonButton = ({ onLoad }) => {
  const fileInputRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = JSON.parse(content);
        onLoad(parsedData);
        setLoadError(null);
      } catch (error) {
        console.error("Invalid JSON file", error);
        setLoadError("Invalid JSON file. Please check the file format.");
      }
    };

    reader.onerror = () => {
      setLoadError("Error reading file. Please try again.");
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="p-2 bg-green-500 text-white rounded-md hover:bg-green-700"
      >
        Načíst
      </button>
      {loadError && (
        <div className="text-red-500 text-sm mt-1">{loadError}</div>
      )}
    </div>
  );
};
