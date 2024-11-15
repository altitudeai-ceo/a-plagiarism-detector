async function sendForDetection(text) {
  const resultDiv = document.getElementById("result");

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

    if (!response.ok) {
      throw new Error("Failed to fetch results from the backend.");
    }

    const data = await response.json();

    console.log("Response data:", data);

    resultDiv.innerHTML = `
      <p><span>Highest Similarity Score:</span> ${data.similarityScore}%</p>
      <p><span>Matches:</span></p>
      <ul>
        ${data.matches
          .map(
            (match) =>
              `<li>Document: "${match.document}" - Similarity: ${match.similarity}%</li>`
          )
          .join("")}
      </ul>
    `;
  } catch (error) {
    console.error("Error occurred:", error);
    resultDiv.innerHTML =
      "<p>An error occurred while analyzing the text. Please try again later.</p>";
  }
}
