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
  const results = referenceDocuments.map((doc, index) => ({
    document: `Reference Document ${index + 1}`,
    similarity: calculateJaccardSimilarity(inputText, doc),
    text: doc, // Include full text of the reference document
  }));

  console.log("Results:", results);

  // Filter matches with similarity > 0
  const matches = results.filter((r) => r.similarity > 0);

  if (matches.length > 0) {
    // Display results with matching reference documents
    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${
        Math.max(...matches.map((r) => r.similarity))
      }%</p>
      <p><span>Matches Found:</span> ${matches.length}</p>
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
