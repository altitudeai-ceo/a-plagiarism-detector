async function sendForDetection(text) {
  const resultDiv = document.getElementById("result");

  try {
    // Prepare the payload
    const payload = {
      text: text,
      documents: [
        "This is a reference document.",
        "Another document to compare against.",
        "Add more documents as needed.",
      ],
    };

    // Send request to the backend
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

    // Display the results
    resultDiv.innerHTML = `
      <p><span>Similarity Score:</span> ${data.similarityScore}%</p>
      <p><span>Matches Found:</span> ${data.matches.length}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML =
      "<p>An error occurred while analyzing the text. Please try again later.</p>";
    console.error(error);
  }
}
