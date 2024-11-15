document.getElementById("analyzeButton").addEventListener("click", checkText);

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
    const reader = new FileReader();

    reader.onload = async function (e) {
      inputText = e.target.result;
      await sendForDetection(inputText);
    };

    reader.onerror = function () {
      resultDiv.innerHTML = "<p>Error reading the file. Please try again.</p>";
    };

    reader.readAsText(file);
  } else {
    await sendForDetection(inputText);
  }
}

async function sendForDetection(text) {
  const resultDiv = document.getElementById("result");

  console.log("Sending text to the backend:", text);

  try {
    const payload = {
      text: text,
      documents: [
        "This is a reference document.",
        "Another document to compare against.",
        "Add more documents as needed.",
      ],
    };

    const response = await fetch("http://localhost:3000/check-plagiarism", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to fetch results from the backend.");
    }

    const data = await response.json();

    console.log("Response data:", data);

    resultDiv.innerHTML = `
      <p><span>Similarity Score:</span> ${data.similarityScore}%</p>
      <p><span>Matches Found:</span> ${data.matches.length}</p>
    `;
  } catch (error) {
    console.error("Error occurred:", error);
    resultDiv.innerHTML =
      "<p>An error occurred while analyzing the text. Please try again later.</p>";
  }
}
