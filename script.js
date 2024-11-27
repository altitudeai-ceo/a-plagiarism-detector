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
  const progressBar = document.getElementById("progressBar");

  let inputText = inputTextArea.value;

  resultDiv.style.display = "none";
  progressBar.style.display = "block";
  progressBar.value = 0;

  if (!inputText.trim() && !fileInput.files.length) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
    progressBar.style.display = "none";
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
        progressBar.style.display = "none";
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

  let progressInterval = setInterval(() => {
    progressBar.value += 10;
    if (progressBar.value >= 100) {
      clearInterval(progressInterval);
    }
  }, 300);

  const matchedResults = await searchGoogleForPlagiarism(inputText);

  setTimeout(() => {
    progressBar.style.display = "none";

    if (matchedResults.length > 0) {
      displayResults(matchedResults);
    } else {
      resultDiv.style.display = "block";
      resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
    }
  }, 3000);
}

async function searchGoogleForPlagiarism(query) {
  const sentences = query.split(/[.?!]/).slice(0, 5); // Limit to first 5 sentences for searches
  const results = [];

  for (const sentence of sentences) {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(sentence)}&format=json`
    );
    const data = await response.json();

    if (data.RelatedTopics) {
      data.RelatedTopics.forEach((topic) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            text: topic.Text,
            url: topic.FirstURL,
          });
        }
      });
    }
  }

  return results;
}

function displayResults(results) {
  const resultDiv = document.getElementById("result");
  const highlightedText = highlightMatches(
    document.getElementById("inputText").value,
    results.map((res) => res.text)
  );

  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
    <p>Analyzed Text with Highlighted Matches:</p>
    <div class="highlighted-text">${highlightedText}</div>
    <ul>
      ${results
        .map(
          (result, index) =>
            `<li><a href="${result.url}" target="_blank">${result.text}</a></li>`
        )
        .join("")}
    </ul>
  `;
}
