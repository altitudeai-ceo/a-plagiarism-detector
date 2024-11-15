document.getElementById("analyzeButton").addEventListener("click", checkText);

async function extractTextFromPDF(file) {
  if (!window.pdfLib || !window.pdfLib.PDFDocument) {
    console.error("pdf-lib library is not loaded. Please check the script inclusion.");
    throw new Error("pdf-lib library not found.");
  }

  const { PDFDocument } = window.pdfLib; // Access PDFDocument from pdf-lib
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  let fullText = "";
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageText = page.getTextContent().items.map((item) => item.str).join(" ");
    fullText += pageText + " ";
  }

  return fullText;
}

function normalizeText(text) {
  return text
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII characters
    .replace(/[.,!?;:()]/g, "") // Remove punctuation
    .toLowerCase()
    .trim();
}

function tokenizeText(text) {
  return normalizeText(text).split(/\s+/);
}

function calculateSimilarity(inputText, referenceText) {
  const inputTokens = tokenizeText(inputText);
  const referenceTokens = tokenizeText(referenceText);

  const matchedWords = [...new Set(inputTokens.filter((word) => referenceTokens.includes(word)))];
  const similarityPercentage = (matchedWords.length / inputTokens.length) * 100;

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
      try {
        inputText = await extractTextFromPDF(file);
      } catch (error) {
        resultDiv.innerHTML = "<p>Error processing PDF. Please try again.</p>";
        console.error(error);
        return;
      }
    } else {
      const reader = new FileReader();
      inputText = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file, "UTF-8");
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

  const normalizedInput = normalizeText(inputText);

  let highestSimilarity = 0;
  let matchedWords = [];
  const results = referenceDocuments.map((doc, index) => {
    const { similarity, matchedWords: words } = calculateSimilarity(normalizedInput, normalizeText(doc));

    if (similarity > highestSimilarity) highestSimilarity = similarity;
    matchedWords = [...matchedWords, ...words];

    return {
      document: `Reference Document ${index + 1}`,
      similarity,
    };
  });

  matchedWords = [...new Set(matchedWords)];

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
