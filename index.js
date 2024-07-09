const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = "https://api.openai.com/v1/chat/completions";
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log(process.env.EMAIL_USER)

app.use(cors());
app.use(express.json());

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

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating text:", error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.error : error.message);
  }
};

const sendEmail = async (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  let mailOptions = {
    from: emailUser,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

app.post('/api/random-text', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const randomText = await generateRandomText();
    await sendEmail(email, 'Generated Random Text By ChatGpt', randomText);
    res.json({ text: randomText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
