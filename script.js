document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
}

function highlightMatches(inputText, referenceWords) {
  const words = inputText.split(/(\s+)/);
  const highlightedWords = words.map((word) => {
    const cleanWord = word.replace(/[.,!?]/g, "").toLowerCase();
    return referenceWords.has(cleanWord)
      ? `<span class="highlight">${word}</span>`
      : word;
  });
  return highlightedWords.join("");
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
    const fileType = file.type;

    if (fileType === "application/pdf") {
      const pdfText = await extractTextFromPDF(file);
      performPlagiarismCheck(pdfText);
    } else if (fileType === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => performPlagiarismCheck(e.target.result);
      reader.readAsText(file);
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
  const resultDiv = document.getElementById("result");

  const referenceDocuments = [
    "This is a reference document.",
    "Another example of a document to compare against.",
  ];

  const referenceWords = new Set(
    referenceDocuments.flatMap((doc) =>
      doc.split(/\s+/).map((word) => word.replace(/[.,!?]/g, "").toLowerCase())
    )
  );

  const highlightedText = highlightMatches(inputText, referenceWords);
  resultDiv.innerHTML = `
    <p>Analyzed Text with Highlighted Matches:</p>
    <div class="highlighted-text">${highlightedText}</div>
  `;
}
