document.getElementById("analyzeButton").addEventListener("click", checkText);

async function checkText() {
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  const progressBar = document.getElementById("progressBar");
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
    const reader = new FileReader();
    inputText = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file, "UTF-8");
    });
  }

  resultDiv.innerHTML = "<p>Analyzing...</p>";
  progressBar.style.width = "0%"; // Reset progress bar
  resultContainer.style.display = "block";

  try {
    // Simulate progress bar update (for demonstration purposes)
    const fakeProgress = setInterval(() => {
      const currentWidth = parseInt(progressBar.style.width);
      if (currentWidth < 90) {
        progressBar.style.width = currentWidth + 10 + "%";
      }
    }, 300);

    // Call plagiarism check API
    const plagiarismResult = await checkPlagiarism(inputText);

    clearInterval(fakeProgress);
    progressBar.style.width = "100%"; // Set to full once analysis is complete

    if (plagiarismResult.matches.length > 0) {
      const matchDetails = plagiarismResult.matches
        .map(
          (match, index) =>
            `<li>Match ${index + 1}: <a href="${match.url}" target="_blank">${match.url}</a> (Similarity: ${match.similarity}%)</li>`
        )
        .join("");

      resultDiv.innerHTML = `
        <p>Plagiarism Detected: ${plagiarismResult.percentage}%</p>
        <ul>${matchDetails}</ul>
      `;
    } else {
      resultDiv.innerHTML = "<p>No plagiarism detected.</p>";
    }
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    resultDiv.innerHTML = "<p>An error occurred while analyzing the text. Please try again later.</p>";
    progressBar.style.width = "0%"; // Reset if there’s an error
  }
}

// Function to call the PlagiarismCheckerAPI
async function checkPlagiarism(inputText) {
  const apiKey = "YOUR_API_KEY_HERE"; // Replace with your API key
  const apiUrl = "https://api.plagiarismcheckerapi.com/v1/check";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ text: inputText }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch plagiarism data");
  }

  const data = await response.json();
  return {
    percentage: data.plagiarism_percentage,
    matches: data.matches.map((match) => ({
      url: match.source_url,
      similarity: match.similarity,
    })),
  };
}
