document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
}

function highlightMatches(inputText, matchedPhrases) {
  // Create a regex to match entire phrases
  const regex = new RegExp(`\\b(${matchedPhrases.join('|')})\\b`, 'gi');

  // Replace matched phrases with highlighted spans
  return inputText.replace(regex, (match) => `<span class="highlight">${match}</span>`);
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
      try {
        const pdfText = await extractTextFromPDF(file);
        performPlagiarismCheck(pdfText);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        resultDiv.innerHTML = "<p>Error reading the PDF file. Please try again.</p>";
      }
    } else if (fileType === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => performPlagiarismCheck(e.target.result);
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
  const resultDiv = document.getElementById("result");

  const referenceDocuments = [
    "This is a reference document.",
    "Another example of a document to compare against.",
    "You can add more documents here for comparison.",
  ];

  // Calculate similarities and collect matched phrases
  const matches = [];
  const matchedPhrases = [];
  const results = referenceDocuments.map((doc, index) => {
    const similarity = calculateJaccardSimilarity(inputText, doc);
    if (similarity > 0) {
      matches.push({
        document: `Reference Document ${index + 1}`,
        similarity,
        text: doc,
      });
      matchedPhrases.push(...doc.split(/\s+/));
    }
    return {
      document: `Reference Document ${index + 1}`,
      similarity,
      text: doc,
    };
  });

  // Highlight matches in the input text
  const highlightedText = highlightMatches(inputText, matchedPhrases);

  // Display results
  if (matches.length > 0) {
    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${
        Math.max(...matches.map((r) => r.similarity))
      }%</p>
      <p><span>Matches Found:</span> ${matches.length}</p>
      <p>Analyzed Text with Highlighted Matches:</p>
      <div class="highlighted-text">${highlightedText}</div>
      <ul>
        ${matches
          .map(
            (match) =>
              `<li><b>${match.document}:</b> "${match.text}" - <b>Similarity:</b> ${match.similarity}%</li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
  }
}
