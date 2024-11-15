document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
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
    const reader = new FileReader();

    reader.onload = function (e) {
      inputText = e.target.result;
      performPlagiarismCheck(inputText);
    };

    reader.onerror = function () {
      resultDiv.innerHTML = "<p>Error reading the file. Please try again.</p>";
    };

    reader.readAsText(file);
  } else {
    performPlagiarismCheck(inputText);
  }
}

function performPlagiarismCheck(inputText) {
  const resultDiv = document.getElementById("result");

  // Reference documents
  const referenceDocuments = [
    "This is a reference document.",
    "Another example of a document to compare against.",
    "You can add more documents here for comparison.",
  ];

  // Calculate similarities
  const results = referenceDocuments.map((doc) => ({
    document: doc,
    similarity: calculateJaccardSimilarity(inputText, doc),
  }));

  // Find the highest similarity score
  const maxSimilarity = Math.max(...results.map((r) => r.similarity));

  // Display results
  resultDiv.innerHTML = `
    <p><span>Highest Similarity Score:</span> ${maxSimilarity}%</p>
    <p><span>Matches:</span></p>
    <ul>
      ${results
        .filter((r) => r.similarity > 0)
        .map(
          (match) =>
            `<li>Document: "${match.document}" - Similarity: ${match.similarity}%</li>`
        )
        .join("")}
    </ul>
  `;
}
