document.getElementById("analyzeButton").addEventListener("click", checkText);

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
    const reader = new FileReader();

    reader.onload = async function (e) {
      inputText = e.target.result;
      await sendForDetection(inputText);
    };

    reader.onerror = function () {
      resultDiv.innerHTML = "<p>Error reading the file. Please try again.</p>";
    };

    reader.readAsText(file);
  } else {
    await sendForDetection(inputText);
  }
}
