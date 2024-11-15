document.getElementById("analyzeButton").addEventListener("click", checkText);

async function extractTextFromPDF(file) {
  const { PDFDocument } = window.pdfLib; // Use pdf-lib library
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  let fullText = "";
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const text = await page.getTextContent();
    const pageText = text.items.map((item) => item.str).join(" ");
    fullText += pageText + " ";
  }

  return fullText;
}

function normalizeText(text) {
  // Remove non-printable characters, normalize Unicode, and strip punctuation
  return text
    .normalize("NFKD") // Normalize Unicode (e.g., accented characters)
    .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII characters
    .replace(/[.,!?;:()]/g, "") // Remove punctuation
    .toLowerCase() // Convert to lowercase
    .trim(); // Remove extra spaces
}

function tokenizeText(text) {
  // Normalize and split text into words
  return normalizeText(text).split(/\s+/);
}

function calculateSimilarity(inputText, referenceText) {
  const normalizedInput = normalizeText(inputText);
  const normalizedReference = normalizeText(referenceText);

  console.log("Normalized Input Text:", normalizedInput);
  console.log("Normalized Reference Text:", normalizedReference);

  const inputTokens = tokenizeText(inputText);
  const referenceTokens = tokenizeText(referenceText);

  console.log("Input Tokens:", inputTokens);
  console.log("Reference Tokens:", referenceTokens);

  // Find unique word matches
  const matchedWords = [...new Set(inputTokens.filter((word) =>
    referenceTokens.includes(word)
  ))];

  console.log("Matched Words:", matchedWords);

  // Calculate similarity based on input text length
  const similarityPercentage =
    (matchedWords.length / inputTokens.length) * 100;

  return {
    similarity: similarityPercentage.toFixed(2),
    matchedWords: matchedWords,
  };
}

function highlightMatches(inputText, matchedWords) {
  let highlightedText = normalizeText(inputText);

  matchedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    highlightedText = highlightedText.replace(
      regex,
      `<span class="highlight">${word}</span>`
    );
  });

  return highlightedText;
}

async function checkText() {
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
    if (file.type === "application/pdf") {
      inputText = await extractTextFromPDF(file);
    } else {
      const reader = new FileReader();
      inputText = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file, "UTF-8"); // Force UTF-8 encoding
      });
    }
  }

  performPlagiarismCheck(inputText);
}

function performPlagiarismCheck(inputText) {
  const resultDiv = document.getElementById("result");

  const referenceDocuments = [
    "This is a reference document that discusses certain topics in detail.",
    "Here is another example of a document to compare against plagiarism cases.",
    "Adding more detailed content ensures better matching and testing results.",
  ];

  // Log raw input text and its length
  console.log("Raw Input Text:", inputText);
  console.log("Input Text Length:", inputText.length);

  // Normalize and log the cleaned input text
  const normalizedInput = normalizeText(inputText);
  console.log("Normalized Input Text:", normalizedInput);

  let highestSimilarity = 0;
  let matchedWords = [];
  const results = referenceDocuments.map((doc, index) => {
    const normalizedDoc = normalizeText(doc);
    console.log(`Normalized Reference Document ${index + 1}:`, normalizedDoc);

    const { similarity, matchedWords: words } = calculateSimilarity(
      normalizedInput,
      normalizedDoc
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

  // Log matched words and results
  console.log("Matched Words:", matchedWords);
  console.log("Similarity Results:", results);

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
