let allQuestions = [];
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;

async function loadTopics() {
  const topicList = [
    "Basic Energy Concepts",
    "Bkrs, Rlys, and Disconnects",
    "Control Rods",
    "Controllers and Positioners",
    "Core Thermal Limits",
    "Demins and Ion Exchange",
    "Fluid Statics and Dynamics",
    "Heat Exchangers",
    "Heat Transfer",
    "Motors and Generators",
    "Neutron Life Cycle",
    "Neutrons",
    "Pumps",
    "Reactivity Coefficients",
    "Reactor Kinetics and Neutron Sources",
    "Reactor Operational Physics",
    "Sensors and Detectors",
    "Thermal Hydraulics",
    "Thermodynamic Cycles",
    "Thermodynamic Processes",
    "Thermodynamic Units and Properties",
    "Valves"
  ];

  const container = document.getElementById('topic-selectors');
  container.innerHTML = '';
  topicList.forEach(topic => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${topic}" checked> ${topic}`;
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });

  document.getElementById('start-btn').onclick = () => startQuiz();
  document.getElementById('fifty-btn').onclick = () => setQuestionCount(50);
  document.getElementById('all-btn').onclick = () => setQuestionCount('all');
}

function selectAll(state) {
  const checkboxes = document.querySelectorAll('#topic-selectors input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = state);
}

function setQuestionCount(num) {
  document.getElementById('question-count').value = num === 'all' ? allQuestions.length : num;
}

async function startQuiz() {
  const checkboxes = document.querySelectorAll('#topic-selectors input[type="checkbox"]:checked');
  const selectedTopics = Array.from(checkboxes).map(cb => cb.value);
  const num = parseInt(document.getElementById('question-count').value);
  allQuestions = [];

  for (const topic of selectedTopics) {
    try {
      const response = await fetch(`questions/${topic}.json`);
      if (!response.ok) throw new Error(`Failed to load ${topic}`);
      const questions = await response.json();
      allQuestions.push(...questions);
    } catch (error) {
      console.error(`Error loading topic ${topic}:`, error);
    }
  }

  allQuestions = allQuestions.filter(q => q.choices && typeof q.choices === 'object');
  if (allQuestions.length === 0) {
    alert("No valid questions found for the selected topics.");
    return;
  }

  selectedQuestions = shuffleArray(allQuestions).slice(0, Math.min(num, allQuestions.length));
  currentIndex = 0;
  score = 0;
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  showQuestion();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showQuestion() {
  const q = selectedQuestions[currentIndex];
  document.getElementById('topic').textContent = `Topic: ${q.topic}`;
  document.getElementById('question').textContent = q.stem || q.question || '';

  const img = document.getElementById('question-image');
  if (q.image) {
    img.src = `images/${q.image}`;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  if (Array.isArray(q.choices)) {
    q.choices.forEach((choice, idx) => {
      const cleaned = choice.replace(/\s*-?\d{3,}-?\s*PWR Test Items/i, '').trim();
      const btn = document.createElement('button');
      btn.textContent = cleaned;
      btn.onclick = () => handleAnswer(String.fromCharCode(65 + idx));
      choicesDiv.appendChild(btn);
    });
  } else {
    Object.entries(q.choices).forEach(([key, value]) => {
      const cleaned = value.replace(/\s*-?\d{3,}-?\s*PWR Test Items/i, '').trim();
      const btn = document.createElement('button');
      btn.textContent = cleaned;
      btn.onclick = () => handleAnswer(key);
      choicesDiv.appendChild(btn);
    });
  }

  document.getElementById('feedback').textContent = '';
  document.getElementById('next-btn').style.display = 'none';
}

function handleAnswer(selected) {
  const correct = selectedQuestions[currentIndex].answer;
  const feedback = document.getElementById('feedback');
  if (selected === correct) {
    feedback.textContent = "Correct!";
    score++;
  } else {
    feedback.textContent = `Incorrect. Correct answer: ${correct}`;
  }
  document.getElementById('next-btn').style.display = 'inline-block';
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < selectedQuestions.length) {
    showQuestion();
  } else {
    document.getElementById('quiz-container').style.display = 'none';
    const summary = `You answered ${score} out of ${selectedQuestions.length} questions correctly.`;
    document.getElementById('result').textContent = summary;
    document.getElementById('result-container').style.display = 'block';
  }
}

function restartQuiz() {
  document.getElementById('result-container').style.display = 'none';
  document.getElementById('quiz-setup').style.display = 'block';
}

window.onload = loadTopics;
