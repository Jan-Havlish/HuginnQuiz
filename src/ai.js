export async function call(api, prompt) {
  console.log("API call initiated");

  if (!api || !prompt) {
    throw new Error("API key and prompt are required");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        api,
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
        // Try to parse the error as JSON
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (jsonError) {
        // If parsing fails, use the raw text
        errorMessage += ` - ${errorText.slice(0, 100)}${errorText.length > 100 ? "..." : ""}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (
      !data ||
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts
    ) {
      throw new Error("Invalid response structure from API");
    }

    let textResponse = data.candidates[0].content.parts[0].text;

    if (!textResponse) {
      throw new Error("Empty response from API");
    }

    // Remove code block wrappers if present
    textResponse = textResponse.replace(/```json\n/g, "");
    textResponse = textResponse.replace(/```/g, "");

    // Attempt to parse the JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      console.log("Successfully parsed JSON response");
      return jsonResponse;
    } catch (jsonError) {
      console.warn("JSON parsing error:", jsonError);
      console.log("Raw Response:", textResponse);
      // Return the string if JSON parsing fails
      return textResponse;
    }
  } catch (error) {
    console.error("API call error:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
