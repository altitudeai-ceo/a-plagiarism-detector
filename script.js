document.getElementById("analyzeButton").addEventListener("click", checkText);

function calculatePhraseSimilarity(inputText, referenceText) {
  const inputPhrases = generatePhrases(inputText, 4); // Use 4-word phrases
  const referencePhrases = generatePhrases(referenceText, 4);

  console.log("Input Phrases:", inputPhrases);
  console.log("Reference Phrases:", referencePhrases);

  const matchedPhrases = inputPhrases.filter((phrase) =>
    referencePhrases.includes(phrase)
  );

  console.log("Matched Phrases:", matchedPhrases);

  const similarityPercentage =
    (matchedPhrases.length / referencePhrases.length) * 100;

  return {
    similarity: similarityPercentage.toFixed(2),
    matchedPhrases: matchedPhrases,
  };
}

function generatePhrases(text, n = 4) {
  // Normalize text: remove punctuation and convert to lowercase
  const cleanText = text.replace(/[.,!?;:()]/g, "").toLowerCase();
  const words = cleanText.split(/\s+/);
  const phrases = [];
  for (let i = 0; i <= words.length - n; i++) {
    phrases.push(words.slice(i, i + n).join(" "));
  }
  return phrases;
}

function highlightMatches(inputText, matchedPhrases) {
  let highlightedText = inputText;

  matchedPhrases.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    highlightedText = highlightedText.replace(
      regex,
      `<span class="highlight">${phrase}</span>`
    );
  });

  return highlightedText;
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
    "This is a reference document that discusses certain topics.",
    "Here is another example of a document to compare against.",
    "You can add even more reference documents here for testing.",
  ];

  let highestSimilarity = 0;
  let matchedPhrases = [];
  const results = referenceDocuments.map((doc, index) => {
    const { similarity, matchedPhrases: phrases } = calculatePhraseSimilarity(
      inputText,
      doc
    );
    if (similarity > highestSimilarity) highestSimilarity = similarity;
    matchedPhrases = [...matchedPhrases, ...phrases];

    return {
      document: `Reference Document ${index + 1}`,
      similarity,
      matchedPhrases: phrases,
    };
  });

  matchedPhrases = [...new Set(matchedPhrases)]; // Remove duplicates

  const highlightedText = highlightMatches(inputText, matchedPhrases);

  // Display results
  if (highestSimilarity > 0) {
    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${highestSimilarity}%</p>
      <p><span>Matches Found:</span> ${
        matchedPhrases.length
      }</p>
      <p>Analyzed Text with Highlighted Matches:</p>
      <div class="highlighted-text">${highlightedText}</div>
      <ul>
        ${results
          .filter((r) => r.similarity > 0)
          .map(
            (match) =>
              `<li><b>${match.document}:</b> <b>Similarity:</b> ${match.similarity}%</li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
  }
}
