document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeButton");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");
  const resultBox = document.getElementById("resultBox");

  if (!analyzeButton || !progressBar || !progressContainer || !resultBox) {
    console.error("One or more critical HTML elements are missing.");
    return;
  }

  console.log("Page loaded and elements initialized.");

  analyzeButton.addEventListener("click", async () => {
    console.log("Analyze button clicked.");

    const inputText = document.getElementById("inputText").value.trim();
    const fileInput = document.getElementById("fileInput").files[0];

    if (!inputText && !fileInput) {
      console.warn("No input text or file uploaded.");
      resultBox.style.display = "block";
      resultBox.innerHTML = "Please provide text or upload a file.";
      return;
    }

    // Reset UI
    resultBox.style.display = "none";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressBar.innerHTML = "0%";

    let textToAnalyze = inputText;

    if (fileInput) {
      try {
        console.log("Processing file input...");
        textToAnalyze = await extractTextFromPDF(fileInput);
        console.log("Extracted text:", textToAnalyze);
      } catch (error) {
        console.error("Error reading file:", error);
        progressContainer.style.display = "none";
        resultBox.style.display = "block";
        resultBox.innerHTML = "Error reading the uploaded file.";
        return;
      }
    }

    try {
      console.log("Text to analyze:", textToAnalyze);

      // Simulate progress bar
      for (let progress = 0; progress <= 100; progress += 10) {
        await delay(200); // Simulate loading delay
        progressBar.style.width = `${progress}%`;
        progressBar.innerHTML = `${progress}%`;
      }

      // Perform analysis
      const matchedResults = await searchGoogleForPlagiarism(textToAnalyze);

      if (matchedResults.length > 0) {
        displayResults(matchedResults);
      } else {
        console.log("No matches found.");
        resultBox.style.display = "block";
        resultBox.innerHTML = "No matches found.";
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      resultBox.style.display = "block";
      resultBox.innerHTML = "An error occurred while analyzing the text.";
    } finally {
      progressContainer.style.display = "none";
    }
  });

  async function searchGoogleForPlagiarism(query) {
    console.log("Searching Google for:", query);

    // Simulated search results for demonstration
    const results = [
      {
        title: "Simulated Result 1",
        link: "https://example.com/1",
        snippet: "This is a simulated result snippet 1.",
      },
      {
        title: "Simulated Result 2",
        link: "https://example.com/2",
        snippet: "This is a simulated result snippet 2.",
      },
    ];

    // Simulate delay
    await delay(1000);
    return results;
  }

  function displayResults(results) {
    console.log("Displaying results:", results);
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
    resultBox.style.display = "block";
  }

  async function extractTextFromPDF(file) {
    console.log("Extracting text from PDF...");
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
    console.log("Extracted text:", fullText);
    return fullText;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
