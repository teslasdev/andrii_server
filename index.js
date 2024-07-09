const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = "https://api.openai.com/v1/chat/completions";

const generateRandomText = async () => {
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Generate a random text" }],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const randomText = response.data.choices[0].message.content.trim();
    console.log("Generated Random Text:", randomText);
  } catch (error) {
    console.error("Error generating text:", error.response ? error.response.data : error.message);
  }
};

generateRandomText();
