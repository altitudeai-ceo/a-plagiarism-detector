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

  if (!text || !documents || !Array.isArray(documents)) {
    console.error("Invalid request. Missing text or documents.");
    return res.status(400).json({ error: "Text and an array of documents are required." });
  }

  try {
    // Initialize HookeJs
    const hooke = new Hooke();

    // Compare input text with reference documents
    const results = documents.map((doc) => ({
      document: doc,
      similarity: hooke.detect(text, doc).similarityPercentage,
    }));

    // Calculate overall similarity
    const maxSimilarity = Math.max(...results.map((r) => r.similarity));

    console.log("Detection results:", results);

    res.json({
      similarityScore: maxSimilarity,
      matches: results.filter((r) => r.similarity > 0),
    });
  } catch (error) {
    console.error("Error during detection:", error.message);
    res.status(500).json({ error: "Error detecting plagiarism." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
