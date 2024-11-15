document.getElementById("analyzeButton").addEventListener("click", checkText);

async function extractTextFromPDF(file) {
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

async function searchDuckDuckGo(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`;
  const response = await fetch(url);
  const data = await response.json();

  // Parse results
  return data.RelatedTopics.map((topic) => ({
    title: topic.Text,
    link: topic.FirstURL,
  }));
}

async function checkText() {
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  const resultContainer = document.querySelector(".result-container");
  let inputText = inputTextArea.value;

  // Hide result container until analysis is done
  resultContainer.style.display = "none";

  if (!inputText.trim() && !fileInput.files.length) {
    resultContainer.style.display = "block";
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
    return;
  }

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    if (file.type === "application/pdf") {
      try {
        inputText = await extractTextFromPDF(file);
      } catch (error) {
        resultContainer.style.display = "block";
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

  resultDiv.innerHTML = "<p>Analyzing...</p>";
  resultContainer.style.display = "block";

  const queries = inputText.match(/.{1,100}/g); // Split into 100-character chunks
  const results = [];

  for (const query of queries) {
    try {
      const matches = await searchDuckDuckGo(query);
      results.push(...matches);
    } catch (error) {
      console.error("Error searching DuckDuckGo:", error);
    }
  }

  if (results.length > 0) {
    resultDiv.innerHTML = `
      <p>Plagiarism Matches Found:</p>
      <ul>
        ${results
          .map(
            (result) =>
              `<li><a href="${result.link}" target="_blank">${result.title}</a></li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    resultDiv.innerHTML = "<p>No matches found.</p>";
  }
}
