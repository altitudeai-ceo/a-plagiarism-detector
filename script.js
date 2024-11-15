document.getElementById("analyzeButton").addEventListener("click", checkText);

function normalizeText(text) {
  // Remove punctuation, convert to lowercase, and trim whitespace
  return text.replace(/[.,!?;:()]/g, "").toLowerCase().trim();
}

function generatePhrases(text, n = 3) {
  // Normalize text
  const cleanText = normalizeText(text);
  const words = cleanText.split(/\s+/);

  console.log("Normalized Text:", cleanText);

  // Generate n-word phrases
  const phrases = [];
  for (let i = 0; i <= words.length - n; i++) {
    phrases.push(words.slice(i, i + n).join(" "));
  }

  console.log(`Generated ${n}-word Phrases:`, phrases);
  return phrases;
}

function calculatePhraseSimilarity(inputText, referenceText) {
  const inputPhrases = generatePhrases(inputText, 3); // Use 3-word phrases
  const referencePhrases = generatePhrases(referenceText, 3);

  console.log("Input Phrases:", inputPhrases);
  console.log("Reference Phrases:", referencePhrases);

  // Find exact matches
  const matchedPhrases = inputPhrases.filter((phrase) =>
    referencePhrases.includes(phrase)
  );

  console.log("Matched Phrases:", matchedPhrases);

  // Calculate similarity
  const similarityPercentage =
    (matchedPhrases.length / referencePhrases.length) * 100;

  return {
    similarity: similarityPercentage.toFixed(2),
    matchedPhrases: matchedPhrases,
  };
}

function highlightMatches(inputText, matchedPhrases) {
  let highlightedText = inputText;

  matchedPhrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    highlightedText = highlightedText.replace(
      regex,
      `<span class="highlight">${phrase}</span>`
    );
  });

  return highlightedText;
}

function checkText() {
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  let inputText = inputTextArea.value;

  resultDiv.style.display = "block";

  if (!inputText.trim() && !fileInput.files.length) {
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
    return;
  }

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => performPlagiarismCheck(e.target.result);
    reader.readAsText(file);
  } else {
    performPlagiarismCheck(inputText);
  }
}

function performPlagiarismCheck(inputText) {
  const resultDiv = document.getElementById("result");

  const referenceDocuments = [
    "This is a reference document that discusses various topics in detail.",
    "Here is another example of a detailed document for testing plagiarism.",
    "Adding more text here helps ensure better matching for comparison purposes.",
  ];

  console.log("Input Text:", inputText);
  console.log("Reference Documents:", referenceDocuments);

  let highestSimilarity = 0;
  let matchedPhrases = [];
  const results = referenceDocuments.map((doc, index) => {
    const { similarity, matchedPhrases: phrases } = calculatePhraseSimilarity(
      inputText,
      doc
    );
    if (similarity > highestSimilarity) highestSimilarity = similarity;
    matchedPhrases = [...matchedPhrases, ...phrases];

    return {
      document: `Reference Document ${index + 1}`,
      similarity,
      matchedPhrases: phrases,
    };
  });

  matchedPhrases = [...new Set(matchedPhrases)]; // Remove duplicates

  console.log("Final Matched Phrases:", matchedPhrases);

  const highlightedText = highlightMatches(inputText, matchedPhrases);

  if (highestSimilarity > 0) {
    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${highestSimilarity}%</p>
      <p><span>Matches Found:</span> ${matchedPhrases.length}</p>
      <p>Analyzed Text with Highlighted Matches:</p>
      <div class="highlighted-text">${highlightedText}</div>
      <ul>
        ${results
          .filter((r) => r.similarity > 0)
          .map(
            (match) =>
              `<li><b>${match.document}:</b> <b>Similarity:</b> ${match.similarity}%</li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
  }
}
