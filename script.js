document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  console.log("Calculating similarity...");
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  console.log("Intersection size:", intersection.size);
  console.log("Union size:", union.size);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
}

async function checkText() {
  console.log("Analyze button clicked.");
  const inputTextArea = document.getElementById("inputText");
  const fileInput = document.getElementById("fileInput");
  const resultDiv = document.getElementById("result");
  let inputText = inputTextArea.value;

  console.log("Input text:", inputText);

  resultDiv.style.display = "block";

  if (!inputText.trim() && !fileInput.files.length) {
    console.error("No input provided.");
    resultDiv.innerHTML = "<p>Please enter text or upload a file to check.</p>";
    return;
  }

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      console.log("File read successfully.");
      inputText = e.target.result;
      performPlagiarismCheck(inputText);
    };

    reader.onerror = function () {
      console.error("Error reading the file.");
      resultDiv.innerHTML = "<p>Error reading the file. Please try again.</p>";
    };

    reader.readAsText(file);
  } else {
    performPlagiarismCheck(inputText);
  }
}

function performPlagiarismCheck(inputText) {
  console.log("Performing plagiarism check...");
  const resultDiv = document.getElementById("result");

  // Reference documents
  const referenceDocuments = [
    "This is a reference document.",
    "Another example of a document to compare against.",
    "You can add more documents here for comparison.",
  ];

  console.log("Reference documents:", referenceDocuments);

  // Calculate similarities
  const results = referenceDocuments.map((doc) => ({
    document: doc,
    similarity: calculateJaccardSimilarity(inputText, doc),
  }));

  console.log("Results:", results);

  // Find the highest similarity score
  const maxSimilarity = Math.max(...results.map((r) => r.similarity));

  console.log("Max similarity score:", maxSimilarity);

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
