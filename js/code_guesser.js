import { QUESTIONS } from './data.js';

console.log("code_guesser.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // References
  const optionsContainer = document.getElementById("options-container");
  const resultText = document.getElementById("result");
  const nextButton = document.getElementById("next-button");

  let correctLanguage = null;
  let currentQuestion = null;

  // Initialize CodeMirror with scroll support
  const editorEl = document.getElementById("code-editor");
  const editor = CodeMirror(editorEl, {
    value: "",
    mode: "python",
    lineNumbers: true,
    theme: "material", // Theme for the editor
    readOnly: true,
    lineWrapping: true, // Long lines will wrap
    viewportMargin: Infinity, // Ensures proper scrolling
  });

  // Supported languages for CodeMirror mapping
  const ALL_LANGUAGES = ["Python", "JavaScript", "C++", "Ruby", "Java", "Lua"];

  let used = JSON.parse(sessionStorage.getItem('usedQuestions')||'[]');
  let currentIdx = null;

  // Function to load a question from the server
  function loadQuestion() {
    if (used.length >= QUESTIONS.length) {
      finishQuiz();
      return;
    }

    // pick a random unused index
    const remaining = QUESTIONS
      .map((_,i) => i)
      .filter(i => !used.includes(i));
    currentIdx = remaining[Math.floor(Math.random() * remaining.length)];

    // render
    const q = QUESTIONS[currentIdx];
    editor.setValue(q.code);
    correctLanguage = q.language;
    createOptionButtons(correctLanguage);
    resultText.textContent = '';
    nextButton.style.display = 'none';
    optionsContainer.style.display = 'flex';
  }

  // Create buttons for answer options
  function createOptionButtons(correctLanguage) {
    optionsContainer.innerHTML = "";

    const distractors = ALL_LANGUAGES.filter((lang) => lang !== correctLanguage);
    shuffleArray(distractors);
    const chosenDistractors = distractors.slice(0, 2);

    const finalOptions = [correctLanguage, ...chosenDistractors];
    shuffleArray(finalOptions);

    finalOptions.forEach((lang) => {
      const btn = document.createElement("button");
      btn.textContent = lang;
      btn.classList.add("option-button");
      btn.addEventListener("click", () => {
        disableAllButtons();
        optionsContainer.style.display = "none"; // Hide options after selection
        submitAnswer(lang, correctLanguage);
      });
      optionsContainer.appendChild(btn);
    });
  }

  // Shuffle array for randomized options
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Disable all option buttons
  function disableAllButtons() {
    const buttons = optionsContainer.querySelectorAll("button");
    buttons.forEach((btn) => (btn.disabled = true));
  }

  // Submit the selected answer
  function submitAnswer(selectedLanguage, correctLanguage) {
    optionsContainer.style.display = "none";
    disableAllButtons();

    const isCorrect = selectedLanguage === correctLanguage;
    if (isCorrect) {
      // only now mark this question as used
      used.push(currentIdx);
      sessionStorage.setItem('usedQuestions', JSON.stringify(used));

      resultText.textContent = "Správně!";
      resultText.className = "correct";
      nextButton.textContent = "Další";
      nextButton.onclick = loadQuestion;
    } else {
      resultText.textContent = "Špatně... Zkus to znovu.";
      resultText.className = "incorrect";
      nextButton.textContent = "Zkusit Znovu";
      nextButton.onclick = () => {
        createOptionButtons(correctLanguage);
        resultText.textContent = "";
        resultText.className = "";
        nextButton.style.display = "none";
        optionsContainer.style.display = "flex";
      };
    }
    nextButton.style.display = "inline-block";
  }

  // Handle the end of the quiz
  function finishQuiz() {
    editor.setValue("// Všechny otázky byly dokončeny!");
    optionsContainer.innerHTML = "";
    optionsContainer.style.display = "none";

    resultText.textContent =
      "Sada hádanek dokončena\nKlikněte na 'Restart' pro opakování.";
    resultText.className = "complete";

    nextButton.textContent = "Restart";
    nextButton.style.display = "inline-block";
    nextButton.onclick = restartQuiz;
  }

  // Restart the quiz
  async function restartQuiz() {
    try {
      const response = await fetch("/reset-quiz", {
        method: "POST",
      });

      if (response.ok) {
        loadQuestion();
      } else {
        console.error("Failed to reset quiz.");
      }
    } catch (error) {
      console.error("Error resetting quiz:", error);
    }
  }

  // Start the quiz
  loadQuestion();
});
