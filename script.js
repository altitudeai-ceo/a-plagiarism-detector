document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
}

async function checkText() {
  console.log("Analyze button clicked.");
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
    const fileType = file.type;

    if (fileType === "application/pdf") {
      console.log("PDF file detected.");
      extractTextFromPDF(file)
        .then((pdfText) => performPlagiarismCheck(pdfText))
        .catch((error) => {
          console.error("Error extracting text from PDF:", error);
          resultDiv.innerHTML = "<p>Error reading the PDF file. Please try again.</p>";
        });
    } else if (fileType === "text/plain") {
      console.log("TXT file detected.");
      const reader = new FileReader();

      reader.onload = function (e) {
        inputText = e.target.result;
        performPlagiarismCheck(inputText);
      };

      reader.onerror = function () {
        console.error("Error reading the TXT file.");
        resultDiv.innerHTML = "<p>Error reading the file. Please try again.</p>";
      };

      reader.readAsText(file);
    } else {
      resultDiv.innerHTML = "<p>Unsupported file format. Please upload a .txt or .pdf file.</p>";
    }
  } else {
    performPlagiarismCheck(inputText);
  }
}

async function extractTextFromPDF(file) {
  const pdfData = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + " ";
  }

  return fullText.trim();
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
