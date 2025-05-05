
let allQuestions = [];
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;

async function loadTopics() {
    const topicList = [
        "Basic Energy Concepts", "Bkrs, Rlys, and Disconnects", "Control Rods",
        "Controllers and Positioners", "Core Thermal Limits", "Demins and Ion Exchange",
        "Fluid Statics and Dynamics", "Heat Exchangers", "Heat Transfer",
        "Motors and Generators", "Neutron Life Cycle", "Neutrons", "Pumps",
        "Reactivity Coefficients", "Reactor Kinetics and Neutron Sources",
        "Reactor Operational Physics", "Sensors and Detectors", "Thermal Hydraulics",
        "Thermodynamic Cycles", "Thermodynamic Processes", "Thermodynamic Units and Properties",
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
    document.querySelectorAll('#topic-selectors input[type=checkbox]')
        .forEach(cb => cb.checked = state);
}

function setQuestionCount(count) {
    const input = document.getElementById('question-count');
    input.value = count === 'all' ? allQuestions.length : count;
}

async function startQuiz() {
    const selectedTopics = Array.from(document.querySelectorAll('#topic-selectors input[type=checkbox]:checked'))
        .map(cb => cb.value);

    allQuestions = [];

    for (const topic of selectedTopics) {
        const filename = topic + '.json';
        try {
            const res = await fetch(`questions/${filename}`);
            const data = await res.json();
            allQuestions.push(...data);
        } catch (err) {
            console.error(`Failed to load ${filename}:`, err);
        }
    }

    const count = document.getElementById('question-count').value;
    const questionCount = count === 'all' ? allQuestions.length : parseInt(count);
    selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, questionCount);
    currentIndex = 0;
    score = 0;
    document.getElementById('selector-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const q = selectedQuestions[currentIndex];
    document.getElementById('topic').textContent = `Topic: ${q.topic}`;
    document.getElementById('question').textContent = q.stem || q.question;

    const img = document.getElementById('question-image');
    if (q.image) {
        img.src = `images/${q.image}`;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    const choices = Array.isArray(q.choices) ? q.choices : Object.values(q.choices);
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.onclick = () => handleAnswer(choice);
        choicesDiv.appendChild(btn);
    });

    document.getElementById('feedback').textContent = '';
    document.getElementById('next-btn').style.display = 'none';
}

function handleAnswer(selected) {
    const q = selectedQuestions[currentIndex];
    const correct = typeof q.answer === 'string' && (
        q.answer === selected ||
        (q.choices && typeof q.choices === 'object' && q.answer in q.choices && q.choices[q.answer] === selected)
    );
    document.getElementById('feedback').textContent = correct ? 'Correct!' : `Incorrect. Correct answer: ${q.answer}`;
    if (correct) score++;
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-container').style.display = 'none';
    const result = document.getElementById('result');
    result.innerHTML = `<h2>Quiz Completed!</h2><p>Your Score: ${score} / ${selectedQuestions.length}</p>`;
    result.style.display = 'block';
}

window.onload = () => {
    loadTopics();
    document.getElementById('next-btn').onclick = nextQuestion;
};
