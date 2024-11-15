document.getElementById("analyzeButton").addEventListener("click", checkText);

function normalizeText(text) {
  // Remove punctuation, convert to lowercase, and trim whitespace
  return text.replace(/[.,!?;:()]/g, "").toLowerCase().trim();
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

function calculateSimilarity(inputText, referenceText) {
  const normalizedInput = normalizeText(inputText);
  const normalizedReference = normalizeText(referenceText);

  const inputWords = normalizedInput.split(/\s+/);
  const referenceWords = normalizedReference.split(/\s+/);

  // Find matches
  const matchedWords = inputWords.filter((word) =>
    referenceWords.includes(word)
  );

  const similarityPercentage =
    (matchedWords.length / referenceWords.length) * 100;

  return {
    similarity: similarityPercentage.toFixed(2),
    matchedWords: matchedWords,
  };
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
    "This is a reference document that discusses certain topics.",
    "Here is another example of a document to compare against.",
    "You can add even more reference documents here for testing.",
  ];

  console.log("Input Text:", inputText);
  console.log("Reference Documents:", referenceDocuments);

  let highestSimilarity = 0;
  let matchedWords = [];
  const results = referenceDocuments.map((doc, index) => {
    const { similarity, matchedWords: words } = calculateSimilarity(
      inputText,
      doc
    );
    if (similarity > highestSimilarity) highestSimilarity = similarity;
    matchedWords = [...matchedWords, ...words];

    return {
      document: `Reference Document ${index + 1}`,
      similarity,
      matchedWords: words,
    };
  });

  matchedWords = [...new Set(matchedWords)]; // Remove duplicates

  console.log("Matched Words:", matchedWords);

  const highlightedText = highlightMatches(inputText, matchedWords);

  if (highestSimilarity > 0) {
    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${highestSimilarity}%</p>
      <p><span>Matches Found:</span> ${matchedWords.length}</p>
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
