document.getElementById("analyzeButton").addEventListener("click", checkText);

async function checkText() {
  const inputTextArea = document.getElementById('inputText');
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');
  let inputText = inputTextArea.value;

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
    const mockResponse = {
      plagiarism_score: Math.floor(Math.random() * 100),
      ai_likelihood: Math.floor(Math.random() * 100),
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    resultDiv.innerHTML = `
      <p><span>Plagiarism Score:</span> ${mockResponse.plagiarism_score}%</p>
      <p><span>AI Detection Likelihood:</span> ${mockResponse.ai_likelihood}%</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = '<p>An error occurred. Please try again later.</p>';
  }
}
