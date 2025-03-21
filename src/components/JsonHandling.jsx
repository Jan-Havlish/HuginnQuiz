import React from "react";

// Save JSON to file
export const SaveJsonButton = ({ data, filename }) => {
  const handleSave = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "quiz.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="p-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
      onClick={handleSave}
    >
      💾 Uložit
    </button>
  );
};

// Load JSON from file
export const LoadJsonButton = ({ onLoad }) => {
  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onLoad(data);
      } catch (error) {
        alert("Invalid JSON file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    document.getElementById("file-input").click();
  };

  return (
    <>
      <input
        type="file"
        id="file-input"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleLoad}
      />
      <button
        className="p-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors"
        onClick={triggerFileInput}
      >
        📂 Načíst
      </button>
    </>
  );
};
