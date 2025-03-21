// netlify/functions/call.js

exports.handler = async (event, context) => {
  console.log("Netlify Function 'call' initiated");

  try {
    // Získání dat z těla požadavku
    const { api, prompt } = JSON.parse(event.body);

    // Pokud není poskytnut API klíč, použije se výchozí uložený v proměnné prostředí
    const apiKey = api || process.env.DEFAULT_API_KEY;

    if (!apiKey || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "API klíč a prompt jsou povinné" }),
      };
    }

    // Volání externího API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (jsonError) {
        errorMessage += ` - ${errorText.slice(0, 100)}${errorText.length > 100 ? "..." : ""}`;
      }
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorMessage }),
      };
    }

    const data = await response.json();

    if (
      !data ||
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts
    ) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid response structure from API" }),
      };
    }

    let textResponse = data.candidates[0].content.parts[0].text;

    if (!textResponse) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Empty response from API" }),
      };
    }

    // Odebrání obalů kódových bloků, pokud jsou přítomny
    textResponse = textResponse.replace(/```json\n/g, "").replace(/```/g, "");

    // Pokus o parsování textu jako JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      console.log("Úspěšně parsován JSON response");
      console.log(jsonResponse);
      return {
        statusCode: 200,
        body: JSON.stringify(jsonResponse),
      };
    } catch (jsonError) {
      console.warn("JSON parsing error:", jsonError);
      console.log("Raw Response:", textResponse);
      return {
        statusCode: 200,
        body: JSON.stringify({ result: textResponse }),
      };
    }
  } catch (error) {
    console.error("API call error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
