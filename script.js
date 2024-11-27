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
  const resultDiv = document.getElementById("resultBox");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");

  let inputText = inputTextArea.value;

  resultDiv.style.display = "none";
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  if (!inputText.trim() && !fileInput.files.length) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
    progressContainer.style.display = "none";
    return;
  }

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    if (file.type === "application/pdf") {
      try {
        inputText = await extractTextFromPDF(file);
      } catch (error) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "<p>Error processing PDF. Please try again.</p>";
        progressContainer.style.display = "none";
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

  let progressValue = 0;
  const progressInterval = setInterval(() => {
    progressValue += 10;
    progressBar.style.width = `${progressValue}%`;
    if (progressValue >= 100) {
      clearInterval(progressInterval);
    }
  }, 300);

  const plagiarismResults = await performPlagiarismCheck(inputText);
  displayResults(plagiarismResults, inputText);

  clearInterval(progressInterval);
  progressContainer.style.display = "none";
}

async function performPlagiarismCheck(inputText) {
  const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
  const searchEngineId = "YOUR_SEARCH_ENGINE_ID"; // Replace with your Custom Search Engine ID

  const sentences = inputText.split(/[.!?]/).filter((sentence) => sentence.trim().length > 0);
  const plagiarismResults = [];

  for (const sentence of sentences) {
    const query = encodeURIComponent(sentence.trim());
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${searchEngineId}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        plagiarismResults.push({
          sentence,
          results: data.items.map((item) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
          })),
        });
      }
    } catch (error) {
      console.error("Error querying Google Custom Search API:", error);
    }
  }

  return plagiarismResults;
}

function displayResults(results, inputText) {
  const resultDiv = document.getElementById("resultBox");
  let highestSimilarity = 0;
  let matchedWords = [];
  let outputHTML = "";

  results.forEach((result, index) => {
    const { sentence, results: matches } = result;
    const normalizedInput = normalizeText(inputText);
    matches.forEach((match) => {
      const { similarity, matchedWords: words } = calculateSimilarity(
        normalizedInput,
        normalizeText(match.snippet)
      );
      if (similarity > highestSimilarity) highestSimilarity = similarity;
      matchedWords = [...matchedWords, ...words];

      outputHTML += `
        <li><b>Match ${index + 1}:</b> <b>Similarity:</b> ${similarity}% - <a href="${match.link}" target="_blank">${match.title}</a></li>
      `;
    });
  });

  const highlightedText = highlightMatches(inputText, matchedWords);

  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
    <p><span>Highest Similarity Score:</span> ${highestSimilarity}%</p>
    <p><span>Matches Found:</span> ${matchedWords.length}</p>
    <p>Analyzed Text with Highlighted Matches:</p>
    <div class="highlighted-text">${highlightedText}</div>
    <ul>${outputHTML}</ul>
  `;
}
