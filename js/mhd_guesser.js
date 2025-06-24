import { MHD_IMAGES } from './data.js';

let usedMhd = JSON.parse(sessionStorage.getItem('usedMhdImages')||'[]');

// JavaScript to handle the game logic
document.addEventListener('DOMContentLoaded', function() {
  const questionImage = document.getElementById('question-image');
  const answerButtonsContainer = document.getElementById('answer-buttons');
  const resultDiv = document.getElementById('result');
  const nextButton = document.getElementById('next-button');
  const tryAgainButton = document.getElementById('try-again-button');

  function loadQuestion() {
    if (usedMhd.length >= MHD_IMAGES.length) {
      usedMhd = [];
    }
    const remaining = MHD_IMAGES.filter((_,i)=>!usedMhd.includes(i));
    const idx = remaining[Math.floor(Math.random()*remaining.length)];
    usedMhd.push(MHD_IMAGES.indexOf(idx));
    sessionStorage.setItem('usedMhdImages', JSON.stringify(usedMhd));

    questionImage.src = idx.image;
    questionImage.alt = 'MHD Image';
    createAnswerButtons(MHD_IMAGES.map(x=>x.city), idx.city);
    resultDiv.textContent = '';
    nextButton.style.display = 'none';
    tryAgainButton.style.display = 'none';
  }

  // Utility to shuffle an array in-place
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /** 
   * Show exactly 3 options: 1 correct, 2 random distractors 
   * @param {string[]} allCities – list of all city names (with duplicates)
   * @param {string} correctCity – the right answer
   */
  function createAnswerButtons(allCities, correctCity) {
    answerButtonsContainer.innerHTML = '';

    // 1) get unique cities
    const unique = Array.from(new Set(allCities));
    // 2) filter out correct
    const wrong = unique.filter(c => c !== correctCity);
    // 3) shuffle and pick 2 distractors
    shuffleArray(wrong);
    const choices = [correctCity, wrong[0], wrong[1]];
    // 4) final shuffle
    shuffleArray(choices);

    choices.forEach(city => {
      const btn = document.createElement('button');
      btn.classList.add('answer-button');
      btn.textContent = city;
      btn.dataset.answer = city;
      btn.dataset.correctAnswer = correctCity;
      btn.addEventListener('click', handleAnswerClick);
      answerButtonsContainer.appendChild(btn);
    });
  }

  function handleAnswerClick(event) {
    const answer = event.target.dataset.answer;
    const correctAnswer = event.target.dataset.correctAnswer;

    answerButtonsContainer.style.display = 'none'; // Hide options after submission

    if (answer === correctAnswer) {
      resultDiv.textContent = 'Správně!';
      resultDiv.classList.add('correct-result');
      resultDiv.classList.remove('incorrect-result');
      nextButton.style.display = 'block';
    } else {
      resultDiv.textContent = 'Špatně... Zkus to znovu';
      resultDiv.classList.add('incorrect-result');
      resultDiv.classList.remove('correct-result');
      tryAgainButton.style.display = 'block';
    }
  }

  nextButton.addEventListener('click', () => {
    loadQuestion();
    answerButtonsContainer.style.display = 'flex'; // Show options when loading next question
  });

  tryAgainButton.addEventListener('click', () => {
    resultDiv.textContent = '';
    resultDiv.classList.remove('correct-result', 'incorrect-result');
    tryAgainButton.style.display = 'none';
    answerButtonsContainer.style.display = 'flex'; // Show options when trying again
  });

  loadQuestion();
});

// Show the popup on page load
window.onload = function() {
  document.getElementById('popup').style.display = 'flex';
};

// Close the popup when the close button is clicked
document.getElementById('close-popup').onclick = function() {
  document.getElementById('popup').style.display = 'none';
};

document.getElementById('fullscreen-button').addEventListener('click', function() {
  const image = document.getElementById('question-image');
  if (image.requestFullscreen) {
    image.requestFullscreen();
  } else if (image.mozRequestFullScreen) { // Firefox
    image.mozRequestFullScreen();
  } else if (image.webkitRequestFullscreen) { // Chrome, Safari and Opera
    image.webkitRequestFullscreen();
  } else if (image.msRequestFullscreen) { // IE/Edge
    image.msRequestFullscreen();
  }
});