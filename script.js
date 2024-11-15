document.getElementById("analyzeButton").addEventListener("click", checkText);

async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    console.error("PDF.js library is not loaded. Please check the script inclusion.");
    throw new Error("PDF.js library not found.");
  }

  const fileReader = new FileReader();
  const arrayBuffer = await new Promise((resolve) => {
    fileReader.onload = (e) => resolve(e.target.result);
    fileReader.readAsArrayBuffer(file);
  });

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + " ";
  }

  return fullText;
}

function normalizeText(text) {
  return text
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[.,!?;:()]/g, "")
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
  let highlightedText = inputText;

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
    {
      text: "This is a reference document that discusses certain topics in detail.",
      url: "https://example.com/document1",
    },
    {
      text: "Here is another example of a document to compare against plagiarism cases.",
      url: "https://example.com/document2",
    },
    {
      text: "Adding more detailed content ensures better matching and testing results.",
      url: "https://example.com/document3",
    },
  ];

  const normalizedInput = normalizeText(inputText);

  let highestSimilarity = 0;
  let matchedWords = [];
  const results = referenceDocuments.map((doc, index) => {
    const { similarity, matchedWords: words } = calculateSimilarity(normalizedInput, normalizeText(doc.text));

    if (similarity > highestSimilarity) highestSimilarity = similarity;
    matchedWords = [...matchedWords, ...words];

    return {
      document: `Reference Document ${index + 1}`,
      similarity,
      url: doc.url,
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
              `<li><b>${match.document}:</b> <b>Similarity:</b> ${match.similarity}% - <a href="${match.url}" target="_blank">View Document</a></li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
  }
}
