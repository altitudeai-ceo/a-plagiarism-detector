document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");
  const resultContainer = document.getElementById("resultContainer");
  const resultBox = document.getElementById("resultBox");

  const googleSearchAPI = "https://www.googleapis.com/customsearch/v1";

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  analyzeButton.addEventListener("click", async () => {
    const inputText = document.getElementById("textInput").value;
    const fileInput = document.getElementById("fileInput").files[0];

    if (!inputText && !fileInput) {
      resultBox.innerHTML = "Please provide text or upload a file.";
      return;
    }

    resultBox.innerHTML = ""; // Clear results
    progressContainer.style.display = "block"; // Show progress bar
    progressBar.style.width = "0%"; // Reset progress bar

    let textToAnalyze = inputText;

    if (fileInput) {
      try {
        textToAnalyze = await extractTextFromPDF(fileInput);
      } catch (error) {
        console.error("Error reading PDF:", error);
        resultBox.innerHTML = "Error reading the uploaded file.";
        progressContainer.style.display = "none";
        return;
      }
    }

    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        progressBar.style.width = `${progress}%`;
        await delay(200); // Simulate loading
      }

      const matchedResults = await searchGoogleForPlagiarism(textToAnalyze);

      if (matchedResults.length > 0) {
        displayResults(matchedResults);
      } else {
        resultBox.innerHTML = "No matches found.";
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      resultBox.innerHTML = "An error occurred while analyzing the text.";
    } finally {
      progressContainer.style.display = "none"; // Hide progress bar
    }
  });

  async function searchGoogleForPlagiarism(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${googleSearchAPI}?q=${encodedQuery}&key=YOUR_GOOGLE_API_KEY&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch search results.");
    }

    const data = await response.json();

    return data.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  }

  function displayResults(results) {
    resultBox.innerHTML = `
      <h3>Search Results:</h3>
      <ul>
        ${results
          .map(
            (result) => `
          <li>
            <a href="${result.link}" target="_blank">${result.title}</a>
            <p>${result.snippet}</p>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
  }

  async function extractTextFromPDF(file) {
    const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.min.js");
    const typedarray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  }
});
