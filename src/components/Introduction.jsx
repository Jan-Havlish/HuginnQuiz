import React, { useState } from "react";

function Introduction() {
  const [activeTab, setActiveTab] = useState(0);

  const tabButtonBase =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1";
  const tabButtonInactive = "bg-gray-200 text-gray-600 hover:bg-gray-300";
  const tabButtonActive = "bg-yellow-400 text-gray-800"; // Use darker text on yellow bg

  return (
    // Removed outer mb-4, let parent control spacing
    <div>
      {/* Tabs Container */}
      {/* Consistent gap and margin */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
        <button
          className={`${tabButtonBase} ${activeTab === 0 ? tabButtonActive : tabButtonInactive}`}
          onClick={() => setActiveTab(0)}
        >
          Úvod
        </button>
        <button
          className={`${tabButtonBase} ${activeTab === 1 ? tabButtonActive : tabButtonInactive}`}
          onClick={() => setActiveTab(1)}
        >
          Použití bez API
        </button>
        <button
          className={`${tabButtonBase} ${activeTab === 2 ? tabButtonActive : tabButtonInactive}`}
          onClick={() => setActiveTab(2)}
        >
          Jak používat s API
        </button>
      </div>

      {/* Tab Content */}
      {/* Consistent padding p-4 */}
      <div className="bg-gray-50 p-4 rounded-md">
        {" "}
        {/* Slightly lighter bg */}
        {/* Tab: Úvod */}
        {activeTab === 0 && (
          // Consistent text styling and spacing
          <div className="space-y-4 text-sm text-gray-700">
            <p className="font-semibold text-base text-gray-800">
              {" "}
              {/* Slightly larger font */}
              Vítejte v Quiz Generatoru! Vytvářejte a hrajte zábavné kvízy.
            </p>
            <p>
              Můžete buď načíst existující kvíz ve formátu JSON, nebo nechat AI
              vygenerovat nový na základě zadaného tématu.
            </p>
            <p>Struktura JSON souboru:</p>
            <pre className="bg-gray-200 p-3 rounded-md text-xs text-gray-800 overflow-x-auto">
              {`{
  "title": "Název Kvízu",
  "questions": [
    {
      "question": "Text otázky?",
      "answers": ["Odpověď A", "Odpověď B", "Odpověď C", "Odpověď D"],
      "correctIndex": 1, // Index správné odpovědi (začíná od 0)
      "timeLimit": 30 // Časový limit v sekundách (nepovinné, výchozí 20)
    },
    // ... další otázky
  ]
}`}
            </pre>
            <p>
              Použijte tlačítko{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                📂 Načíst JSON
              </span>{" "}
              pro nahrání souboru nebo{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                Vygenerovat Kvíz
              </span>{" "}
              pro tvorbu pomocí AI.
            </p>
          </div>
        )}
        {/* Tab: Použití bez API */}
        {activeTab === 1 && (
          <div className="space-y-3 text-sm text-gray-700">
            <h3 className="font-semibold text-base text-gray-800 mb-1">
              Použití kvízu bez API (načtení JSON)
            </h3>
            <p>
              Pokud máte kvíz připravený v JSON souboru, můžete ho snadno načíst
              a spustit:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Klikněte na tlačítko{" "}
                <span className="font-mono bg-gray-200 px-1 rounded">
                  📂 Načíst JSON
                </span>{" "}
                v sekci "Správa souborů" (otevřete Nastavení{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline align-text-bottom"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                ).
              </li>
              <li>Vyberte váš soubor s příponou `.json`.</li>
              <li>
                Ujistěte se, že JSON má správnou strukturu (viz záložka Úvod).
              </li>
              <li>
                Po úspěšném načtení se může zobrazit náhled nebo potvrzení.
              </li>
              <li>
                Kvíz můžete uložit pod jiným názvem pomocí{" "}
                <span className="font-mono bg-gray-200 px-1 rounded">
                  💾 Uložit JSON
                </span>
                .
              </li>
              <li>
                Spusťte kvíz (tlačítko se objeví po načtení, nebo použijte
                hlavní tlačítko).
              </li>
            </ol>
            <p>
              Tento režim nevyžaduje API klíč ani připojení k internetu (kromě
              načtení aplikace).
            </p>
          </div>
        )}
        {/* Tab: Jak používat s API */}
        {activeTab === 2 && (
          <div className="space-y-3 text-sm text-gray-700">
            <h3 className="font-semibold text-base text-gray-800 mb-1">
              Generování kvízu pomocí AI (s API)
            </h3>
            <p>Pro automatické vytvoření kvízu na zadané téma:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Zadejte téma kvízu do hlavního vstupního pole (např. "Hlavní
                města Evropy").
              </li>
              <li>
                Otevřete Nastavení (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline align-text-bottom"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                ) a zvolte zdroj API klíče:
              </li>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>
                  <b>Použít cloudový:</b> Doporučená, jednodušší volba. Má
                  omezený počet použití zdarma.
                </li>
                <li>
                  <b>Použít vlastní:</b> Vyžaduje vložení vašeho Google AI
                  (Gemini) API klíče. Klíč získáte{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    zde
                  </a>
                  . Váš klíč bude uložen pouze lokálně ve vašem prohlížeči.
                </li>
              </ul>
              <li>Nastavte požadovaný počet otázek (1-20).</li>
              <li>
                Klikněte na{" "}
                <span className="font-mono bg-gray-200 px-1 rounded">
                  Vygenerovat Kvíz
                </span>
                . Generování může chvíli trvat.
              </li>
              <li>
                Po dokončení (pokud máte zapnuté potvrzení) se zobrazí dialog,
                kde můžete kvíz uložit nebo rovnou spustit.
              </li>
            </ol>
            <p className="text-xs italic text-gray-600 mt-2">
              Poznámka: Kvalita vygenerovaných otázek závisí na AI. Cloudové API
              je omezené a zabezpečené proti nadměrnému využití.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Introduction;
