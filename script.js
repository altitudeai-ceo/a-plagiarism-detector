document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculateJaccardSimilarity(text1, text2) {
  const set1 = new Set(text1.split(/\s+/));
  const set2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return ((intersection.size / union.size) * 100).toFixed(2); // Return percentage
}

function highlightMatches(inputText, referenceWords) {
  // Split input text into words and preserve spaces
  const words = inputText.split(/(\s+)/); // This preserves spaces as separate elements
  const highlightedWords = words.map((word) => {
    const cleanWord = word.replace(/[.,!?]/g, "").toLowerCase(); // Remove punctuation and lowercase
    return referenceWords.has(cleanWord)
      ? `<span class="highlight">${word}</span>`
      : word;
  });
  return highlightedWords.join(""); // Join the words back together
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

      reader.onload = function (e) {
        inputText = e.target.result;
        performPlagiarismCheck(inputText);
      };

      reader.onerror = function () {
        resultDiv.innerHTML = "<p>Error reading the TXT file. Please try again.</p>";
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
  const resultDiv = document.getElementById("result");

  // Reference documents
  const referenceDocuments = [
    "This is a reference document.",
    "Another example of a document to compare against.",
    "You can add more documents here for comparison.",
  ];

  // Calculate similarities and collect matched words
  const referenceWords = new Set();
  const results = referenceDocuments.map((doc, index) => {
    // Add all words from the document to the referenceWords set
    doc.split(/\s+/).forEach((word) =>
      referenceWords.add(word.replace(/[.,!?]/g, "").toLowerCase())
    );

    return {
      document: `Reference Document ${index + 1}`,
      similarity: calculateJaccardSimilarity(inputText, doc),
      text: doc,
    };
  });

  // Highlight matches in the input text
  const highlightedText = highlightMatches(inputText, referenceWords);

  // Filter matches with similarity > 0
  const matches = results.filter((r) => r.similarity > 0);

  if (matches.length > 0) {
    // Display results with matching reference documents
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
