// netlify/functions/call.js
exports.handler = async (event, context) => {
  console.log("Netlify Function 'call' initiated");
  try {
    // Parse request data
    const { quizTopic, questionCount, api } = JSON.parse(event.body);

    // Security check: Require topic and question count
    if (!quizTopic || !questionCount) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Quiz topic and question count are required",
        }),
      };
    }

    // Use environment variable for API key, never expose it to client
    const apiKey = api || process.env.DEFAULT_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API configuration error" }),
      };
    }

    // Build the prompt server-side to prevent prompt injection attacks
    const prompt = buildQuizPrompt(quizTopic, questionCount);

    // Rate limiting (optional, pseudocode - implement based on your needs)
    // const clientIP = event.headers['client-ip'] || event.requestContext.identity.sourceIp;
    // if (await hasExceededRateLimit(clientIP)) {
    //   return {
    //     statusCode: 429,
    //     body: JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
    //   };
    // }

    // Call external API
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

    // Remove code block wrappers if present
    textResponse = textResponse.replace(/```json\n/g, "").replace(/```/g, "");

    // Try to parse text as JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      console.log("Successfully parsed JSON response");
      return {
        statusCode: 200,
        body: JSON.stringify(jsonResponse),
      };
    } catch (jsonError) {
      console.warn("JSON parsing error:", jsonError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid JSON received from API" }),
      };
    }
  } catch (error) {
    console.error("API call error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};

// Build quiz prompt server-side to prevent prompt injection
function buildQuizPrompt(topic, numberOfQuestions) {
  return `Hi, Create a Kahoot-style quiz in JSON format with the following structure:

{
  "title": "Your Quiz Title",
  "questions": [
    {
      "question": "Question text goes here?",
      "answers": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
      "correctIndex": 0,
      "timeLimit": 20
    }
    // More questions...
  ]
}

Requirements:
Generate ${numberOfQuestions} multiple-choice questions about ${topic}
Each question must have exactly 4 answer options
The correctIndex should be the 0-based index of the correct answer (0-3)
timeLimit specifies how many seconds users have to answer (10-30 seconds)
Make questions engaging and varied in difficulty
Include a mix of text-based questions
Ensure there is only one correct answer per question
Give the quiz an appropriate title

Please format your output as valid JSON that can be directly used inside a quiz application.`;
}
