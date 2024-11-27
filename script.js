document.getElementById("analyzeButton").addEventListener("click", async function () {
    const inputText = document.getElementById("inputText").value.trim();
    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");
    const progressBar = document.getElementById("progressBar");

    // Clear previous results
    resultDiv.style.display = "none";
    progressBar.style.display = "block";
    progressBar.value = 0;

    if (!inputText && fileInput.files.length === 0) {
        alert("Please enter text or upload a file.");
        progressBar.style.display = "none";
        return;
    }

    let textToAnalyze = inputText;

    if (fileInput.files.length > 0) {
        textToAnalyze = await extractTextFromPDF(fileInput.files[0]);
    }

    if (!textToAnalyze) {
        alert("Failed to read the file. Please try again.");
        progressBar.style.display = "none";
        return;
    }

    // Split text into sentences
    const sentences = textToAnalyze.match(/[^.?!]+[.!?]/g) || [textToAnalyze];
    const allResults = [];

    // Query each sentence
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 5) {
            const results = await performDuckDuckGoSearch(sentence);
            allResults.push(...results);

            // Update progress bar
            progressBar.value = ((i + 1) / sentences.length) * 100;
        }
    }

    progressBar.style.display = "none";

    if (allResults.length > 0) {
        displayResults(allResults, textToAnalyze);
    } else {
        resultDiv.innerHTML = "<p>No matches found with reference documents.</p>";
        resultDiv.style.display = "block";
    }
});

// DuckDuckGo Search Function
async function performDuckDuckGoSearch(query) {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    const results = [];

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.forEach((topic) => {
            if (topic.FirstURL && topic.Text) {
                results.push({
                    url: topic.FirstURL,
                    text: topic.Text,
                });
            }
        });
    }

    return results;
}

// Display Results
function displayResults(results, inputText) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<h3>Highest Similarity Score: ${calculateSimilarity(inputText, results)}%</h3>`;
    resultDiv.innerHTML += "<ul>";

    results.forEach((result, index) => {
        resultDiv.innerHTML += `
            <li>
                Reference Document ${index + 1}: <a href="${result.url}" target="_blank">${result.text}</a>
            </li>
        `;
    });

    resultDiv.innerHTML += "</ul>";
    resultDiv.style.display = "block";
}

// Simple Similarity Calculation (Placeholder)
function calculateSimilarity(inputText, results) {
    // A more sophisticated approach should be implemented for semantic similarity.
    return Math.min(results.length * 5, 100).toFixed(2); // Example: 5% per result
}

// Extract Text from PDF
async function extractTextFromPDF(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async function (e) {
            try {
                const pdfjsLib = window["pdfjs-dist/build/pdf"];
                pdfjsLib.GlobalWorkerOptions.workerSrc = "//mozilla.github.io/pdf.js/build/pdf.worker.js";

                const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
                let text = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    content.items.forEach((item) => {
                        text += item.str + " ";
                    });
                }

                resolve(text.trim());
            } catch (err) {
                console.error("Error reading PDF:", err);
                reject("");
            }
        };

        reader.onerror = function () {
            reject("");
        };

        reader.readAsArrayBuffer(file);
    });
}
