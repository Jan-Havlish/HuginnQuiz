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
              <li>Klikněte na „Start Quiz“ pro spuštění kvízu.</li>
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
              Můžete také generovat kvíz dynamicky pomocí API (např. přes velký
              jazykový model). Postup je následující:
            </p>
            <ol className="list-decimal list-inside mb-4">
              <li>Vložte svůj API klíč do příslušného pole.</li>
              <li>Uveďte téma kvízu a počet otázek.</li>
              <li>
                Klikněte na „Generate Quiz“, čímž se z API získá JSON kvíz.
              </li>
              <li>
                Vygenerovaný JSON se zobrazí v textovém poli – můžete ho ještě
                upravit, pokud chcete.
              </li>
              <li>Stiskněte „Start Quiz“ a kvíz se spustí.</li>
            </ol>
            <p className="mb-2">
              Ujistěte se, že je váš API klíč platný a že máte potřebná práva
              pro danou službu.
            </p>
            <p>
              Pro získání API klíče Gemini zdarma klikněte{" "}
              <a
                href="https://aistudio.google.com/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-900"
              >
                zde
              </a>{" "}
              přihlašte se, klikněte na tlačítko s ikonou klíče - "Get a key".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
