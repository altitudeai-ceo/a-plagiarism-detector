document.getElementById("analyzeButton").addEventListener("click", async () => {
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  const progressBar = document.getElementById("progressBar");
  const progressContainer = document.getElementById("progressContainer");

  // Reset UI
  resultDiv.style.display = "none";
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressBar.textContent = "0%";

  const updateProgressBar = (percentage) => {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  };

  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress >= 90) {
      clearInterval(progressInterval);
    } else {
      progress += 10;
      updateProgressBar(progress);
    }
  }, 300);

  try {
    let inputText = inputTextArea.value.trim();

    if (!inputText && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.type === "application/pdf") {
        inputText = await extractTextFromPDF(file);
      } else {
        inputText = await file.text();
      }
    }

    if (!inputText) {
      throw new Error("No text or file input provided.");
    }

    // Perform the plagiarism check here
    performPlagiarismCheck(inputText);

    // Stop progress bar and complete to 100%
    clearInterval(progressInterval);
    updateProgressBar(100);

  } catch (error) {
    clearInterval(progressInterval);
    progressBar.style.backgroundColor = "red";
    progressBar.textContent = "Error";
    resultDiv.innerHTML = `<p>An error occurred: ${error.message}</p>`;
    resultDiv.style.display = "block";
    console.error("Error during plagiarism check:", error);
  } finally {
    setTimeout(() => {
      progressContainer.style.display = "none";
    }, 1000);
  }
});

async function extractTextFromPDF(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ");
  }
  return text;
}

function performPlagiarismCheck(text) {
  // Simulate checking plagiarism (replace this logic with a real API call)
  setTimeout(() => {
    const resultDiv = document.getElementById("result");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
      <h3>Plagiarism Check Results:</h3>
      <p>Similarity Score: 85%</p>
      <ul>
        <li><a href="https://example.com/document1" target="_blank">Document 1</a> - Similarity: 90%</li>
        <li><a href="https://example.com/document2" target="_blank">Document 2</a> - Similarity: 75%</li>
      </ul>
    `;
  }, 2000); // Simulate a 2-second delay for processing
}
