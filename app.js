
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
}

function selectAll(state) {
  document.querySelectorAll('#topic-selectors input[type=checkbox]').forEach(cb => cb.checked = state);
}

function setQuestionCount(count) {
  document.getElementById('question-count').value = count === 'all' ? '' : count;
}

async function startQuiz() {
  const selectedTopics = [...document.querySelectorAll('#topic-selectors input[type=checkbox]:checked')].map(cb => cb.value);
  const countInput = document.getElementById('question-count').value;
  const count = countInput === '' ? null : parseInt(countInput);

  allQuestions = [];

 for (const topic of selectedTopics) {
  try {
    const res = await fetch(`questions/${topic}.json`);
    if (!res.ok) throw new Error(`Failed to load ${topic}`);
    
    const questions = await res.json();
    if (Array.isArray(questions) && questions.length > 0) {
      allQuestions.push(...questions);
    } else {
      console.warn(`Skipped empty or invalid file: ${topic}.json`);
    }
  } catch (err) {
    alert(`Error loading topic: ${topic}`);
    console.error(err);
  }
}


  allQuestions = allQuestions.sort(() => Math.random() - 0.5);
  selectedQuestions = count && count < allQuestions.length ? allQuestions.slice(0, count) : allQuestions;

  document.getElementById('selector-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  showQuestion();
}

function showQuestion() {
  const q = selectedQuestions[currentIndex];
  document.getElementById('topic').textContent = `Topic: ${q.topic}`;
  document.getElementById('question').textContent = q.question;

  const img = document.getElementById('question-image');
  if (q.image) {
    img.src = `images/${q.image}`;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(choice.charAt(0));
    choicesDiv.appendChild(btn);
  });

  document.getElementById('feedback').textContent = '';
  document.getElementById('next-btn').style.display = 'none';
}

function handleAnswer(selected) {
  const correct = selectedQuestions[currentIndex].answer;
  const feedback = document.getElementById('feedback');
  if (selected === correct) {
    feedback.textContent = '✅ Correct!';
    feedback.style.color = 'green';
    score++;
  } else {
    feedback.textContent = `❌ Incorrect. Correct answer: ${correct}`;
    feedback.style.color = 'red';
  }

  document.querySelectorAll('#choices button').forEach(btn => btn.disabled = true);
  document.getElementById('next-btn').style.display = 'inline-block';
}

document.getElementById('next-btn').addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < selectedQuestions.length) {
    showQuestion();
  } else {
    const result = document.getElementById('result');
    result.style.display = 'block';
    result.innerHTML = `<h3>Quiz Complete!</h3><p>Your score: ${score} / ${selectedQuestions.length}</p>`;
    document.getElementById('next-btn').style.display = 'none';
  }
});

window.onload = loadTopics;
