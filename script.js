<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plagiarism & AI Detector</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0b1120;
      color: #ffffff;
      overflow-x: hidden;
    }

    header {
      text-align: center;
      padding: 2rem 0;
      background-color: #0d1b2a;
      color: #ffffff;
    }

    header h1 {
      font-size: 2.5rem;
      margin: 0;
      color: #5bc0be;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      margin: 0 auto;
      max-width: 800px;
      background: #112d4e;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    }

    .container h2 {
      color: #ffffff;
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    textarea, input[type="file"] {
      width: 100%;
      padding: 1rem;
      margin-bottom: 1rem;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      background: #3e517a;
      color: #ffffff;
    }

    button {
      background: #5bc0be;
      color: #ffffff;
      font-size: 1rem;
      padding: 1rem 2rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
      transition: background-color 0.3s ease-in-out;
    }

    button:hover {
      background: #1b8a9d;
    }

    .result {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #3e517a;
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .result span {
      font-weight: bold;
      color: #5bc0be;
    }

    footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.9rem;
      color: #ffffff;
    }

    footer a {
      color: #5bc0be;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <header>
    <h1>Plagiarism & AI Detector</h1>
  </header>
  <div class="container">
    <h2>Check Your Work</h2>
    <textarea id="inputText" placeholder="Paste your text here..."></textarea>
    <p style="text-align: center;">OR</p>
    <input type="file" id="fileInput" accept=".txt" />
    <button onclick="checkText()">Analyze</button>
    <div id="result" class="result" style="display: none;"></div>
  </div>

  <footer>
    <p>&copy; 2024 Plagiarism & AI Detector. All rights reserved. <a href="#">Privacy Policy</a></p>
  </footer>

  <script>
    async function checkText() {
      const inputTextArea = document.getElementById('inputText');
      const fileInput = document.getElementById('fileInput');
      const resultDiv = document.getElementById('result');
      let inputText = inputTextArea.value;

      // Ensure result div is visible
      resultDiv.style.display = 'block';

      if (!inputText.trim() && !fileInput.files.length) {
        resultDiv.innerHTML = '<p>Please enter text or upload a file to check.</p>';
        return;
      }

      if (fileInput.files.length) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
          inputText = e.target.result;
          await sendForDetection(inputText);
        };

        reader.onerror = function () {
          resultDiv.innerHTML = '<p>Error reading the file. Please try again.</p>';
        };

        reader.readAsText(file);
      } else {
        await sendForDetection(inputText);
      }
    }

    async function sendForDetection(text) {
      const resultDiv = document.getElementById('result');

      try {
        // Mock API response (replace this with your real API)
        const mockResponse = {
          plagiarism_score: Math.floor(Math.random() * 100),
          ai_likelihood: Math.floor(Math.random() * 100),
        };

        // Simulating a short delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Display results
        resultDiv.innerHTML = `
          <p><span>Plagiarism Score:</span> ${mockResponse.plagiarism_score}%</p>
          <p><span>AI Detection Likelihood:</span> ${mockResponse.ai_likelihood}%</p>
        `;
      } catch (error) {
        resultDiv.innerHTML = '<p>An error occurred. Please try again later.</p>';
      }
    }
  </script>
</body>
</html>

