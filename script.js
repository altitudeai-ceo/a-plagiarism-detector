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

async function performGoogleSearch(inputText) {
  const searchQueries = inputText.split(".").slice(0, 5); // Extract up to 5 sentences for queries
  const results = [];
  
  for (const query of searchQueries) {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
    );
    const data = await response.json();
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.forEach((topic) => {
        if (topic.FirstURL && topic.Text) {
          results.push({
            url: topic.FirstURL,
            text: topic.Text,
          });
        }
      });
    }
  }
  return results;
}

async function performPlagiarismCheck(inputText) {
  const resultDiv = document.getElementById("result");

  try {
    const googleResults = await performGoogleSearch(inputText);

    if (googleResults.length > 0) {
      const matchedWords = inputText.split(" ").filter((word) =>
        googleResults.some((result) => result.text.includes(word))
      );

      const highlightedText = highlightMatches(inputText, matchedWords);
      resultDiv.style.display = "block";
      resultDiv.innerHTML = `
        <p><span>Matches Found:</span> ${googleResults.length}</p>
        <p>Analyzed Text with Highlighted Matches:</p>
        <div class="highlighted-text">${highlightedText}</div>
        <ul>
          ${googleResults
            .map(
              (result, index) =>
                `<li><b>Reference ${index + 1}:</b> <a href="${result.url}" target="_blank">${result.text}</a></li>`
            )
            .join("")}
        </ul>
      `;
    } else {
      resultDiv.style.display = "block";
      resultDiv.innerHTML = "<p>No matches found with online sources.</p>";
    }
  } catch (error) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<p>Error while performing the plagiarism check. Please try again.</p>";
    console.error(error);
  }
}

async function checkText() {
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  let inputText = inputTextArea.value;

  resultDiv.style.display = "none";

  if (!inputText.trim() && !fileInput.files.length) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
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
