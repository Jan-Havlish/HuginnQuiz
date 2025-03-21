import React, { useState } from "react";

export default function Introduction() {
  // 0 = Úvod, 1 = Použití bez API, 2 = Jak používat s API
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mb-4">
      {/* Tlačítka karet */}
      <div className="flex gap-2 mb-4">
        <button
          className={`p-2 rounded-md ${
            activeTab === 0 ? "bg-yellow-300 text-zinc-700" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab(0)}
        >
          Úvod
        </button>
        <button
          className={`p-2 rounded-md ${
            activeTab === 1 ? "bg-yellow-400 text-zinc-700" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Použití bez API
        </button>
        <button
          className={`p-2 rounded-md ${
            activeTab === 2 ? "bg-yellow-400 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab(2)}
        >
          Jak používat s API
        </button>
      </div>

      {/* Obsah karet */}
      <div className="bg-gray-100 p-3 rounded-md">
        {/* Karta: Úvod */}
        {activeTab === 0 && (
          <div>
            <p className="font-bold text-l mb-4">
              Tato aplikace je vytvořena pro zábavné kvízy! Můžete si upravit
              otázky pomocí JSON formátu nebo vygenerovat nové kvízy pomocí AI.
            </p>
            <p className="mb-2">
              Vložte JSON kvízu níže nebo si ho nechte vygenerovat pomocí AI.
            </p>
            <pre className="bg-gray-200 p-3 rounded-md text-sm overflow-x-auto mb-4">
              {`{
"title": "Quiz Title",
"questions": [
  {
    "question": "What is 2+2?",
    "answers": ["3", "4", "5", "6"],
    "correctIndex": 1,
    "timeLimit": 20
  }
]
}`}
            </pre>
          </div>
        )}

        {/* Karta: Použití bez API */}
        {activeTab === 1 && (
          <div>
            <h3 className="font-bold text-xl mb-4">Použití kvízu bez API</h3>
            <p className="mb-2">
              Pokud nechcete využít AI generování, stačí zkopírovat váš JSON s
              kvízem a vložit ho do textového pole. Dbejte na to, aby váš JSON
              měl správnou strukturu (název kvízu, pole otázek, každá otázka
              musí obsahovat text, pole odpovědí, správný index odpovědi a
              časový limit).
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Otevřete aplikaci s kvízem v prohlížeči.</li>
              <li>Najděte textové pole a vložte do něj svůj JSON.</li>
              <li>Klikněte na „Spustit Kvíz" pro spuštění kvízu.</li>
            </ul>
            <p>
              Tento režim nevyžaduje žádný API klíč ani další nastavení – stačí
              jen validní JSON!
            </p>
          </div>
        )}

        {/* Karta: Jak používat s API */}
        {activeTab === 2 && (
          <div>
            <h3 className="font-bold text-xl mb-4">Jak používat s API</h3>
            <p className="mb-2">
              Pro generování kvízů pomocí AI máte dvě možnosti:
            </p>
            <h4 className="font-semibold mt-3 mb-1">Vlastní API klíč:</h4>
            <ol className="list-decimal list-inside mb-4">
              <li>Vyberte možnost „Použít vlastní API klíč".</li>
              <li>Vložte svůj API klíč do příslušného pole.</li>
              <li>Uveďte téma kvízu a požadovaný počet otázek (1-20).</li>
              <li>Klikněte na „Vygenerovat Kvíz" a počkejte na výsledek.</li>
              <li>Vygenerovaný JSON můžete dále upravit podle potřeby.</li>
            </ol>
            <h4 className="font-semibold mt-3 mb-1">Cloudový API klíč:</h4>
            <p className="mb-2">
              Aplikace nabízí omezený počet generování kvízů prostřednictvím
              našeho API klíče:
            </p>
            <ol className="list-decimal list-inside mb-4">
              <li>Vyberte možnost „Použít cloudový API klíč".</li>
              <li>Zadejte téma kvízu a počet otázek.</li>
              <li>Klikněte na „Vygenerovat Kvíz".</li>
              <li>
                Mějte prosím na paměti, že tato možnost má omezený počet použití
                pro každého uživatele.
              </li>
            </ol>
            <p className="mb-2">
              Pro získání vlastního API klíče Gemini zdarma klikněte{" "}
              <a
                href="https://aistudio.google.com/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-900"
              >
                zde
              </a>
              , přihlašte se a klikněte na tlačítko s ikonou klíče - "Get a
              key".
            </p>
            <p className="text-sm italic text-gray-600 mt-2">
              Poznámka: Z bezpečnostních důvodů je při použití cloudového API
              klíče generování omezeno a zabezpečeno proti zneužití.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
