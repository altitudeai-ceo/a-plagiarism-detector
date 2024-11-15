const express = require("express");
const bodyParser = require("body-parser");
const Hooke = require("hooke-js");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Plagiarism detection endpoint
app.post("/check-plagiarism", async (req, res) => {
  const { text, documents } = req.body;

  console.log("Received text:", text);
  console.log("Reference documents:", documents);

  if (!text || !documents) {
    return res.status(400).json({ error: "Text and documents are required." });
  }

  try {
    // Initialize HookeJs
    const hooke = new Hooke();

    // Compare input text with documents
    const result = hooke.detect(text, documents);

    console.log("Plagiarism detection result:", result);

    // Return similarity percentage and matches
    res.json({
      similarityScore: result.similarityPercentage,
      matches: result.matches,
    });
  } catch (error) {
    console.error("Error during detection:", error);
    res.status(500).json({ error: "Error detecting plagiarism." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});