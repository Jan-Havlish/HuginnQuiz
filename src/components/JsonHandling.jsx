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
      className="px-4 py-2 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-green-500 hover:bg-green-600 order-3 sm:order-2 focus:ring-green-400"
      onClick={handleSave}
    >
      {/* Children or default content */}
      {/* Example default content: */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
        />
      </svg>
      Uložit JSON
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
        className="px-4 py-2 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-green-500 hover:bg-green-600 focus:ring-green-400" /* Example combined class */
        onClick={triggerFileInput}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Načíst JSON
      </button>
    </>
  );
};
