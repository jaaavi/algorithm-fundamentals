let quizData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

// DOM Elements
const screenHome = document.getElementById('screen-home');
const screenQuiz = document.getElementById('screen-quiz');
const screenResult = document.getElementById('screen-result');

const loader = document.getElementById('loader');
const topicsGrid = document.getElementById('topics-grid');

const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnHome = document.getElementById('btn-home');

const progressFill = document.getElementById('progress-fill');
const quizCounter = document.getElementById('quiz-counter');
const questionTheme = document.getElementById('question-theme');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const feedbackPanel = document.getElementById('feedback-panel');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');
const scoreText = document.getElementById('score-text');

// Init application
document.addEventListener('DOMContentLoaded', loadDatabase);

async function loadDatabase() {
    try {
        const res = await fetch('db.json');
        if (!res.ok) throw new Error("No db.json found");
        quizData = await res.json();
        renderTopics();
    } catch (e) {
        loader.innerHTML = `<span style="color:var(--danger)">Error al cargar la base de datos de preguntas. Comprueba que db.json existe.</span>`;
        console.error(e);
    }
}

function renderTopics() {
    loader.style.display = 'none';
    topicsGrid.innerHTML = '';

    const sortedTopics = Object.keys(quizData).sort();

    sortedTopics.forEach(topic => {
        const questionsCount = quizData[topic].length;
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => startQuiz(topic);
        
        card.innerHTML = `
            <div class="topic-card-title">${topic}</div>
            <div class="topic-card-meta">${questionsCount} preguntas disponibles</div>
        `;
        topicsGrid.appendChild(card);
    });
}

function switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Logic Quiz
function shuffleArray(array) {
    // Para barajar las preguntas aleatoriamente
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz(topic) {
    // Clonamos y barajamos
    currentQuestions = shuffleArray([...quizData[topic]]);
    currentQuestionIndex = 0;
    score = 0;
    questionTheme.textContent = topic;
    
    switchScreen(screenQuiz);
    renderQuestion();
}

function renderQuestion() {
    isAnswered = false;
    feedbackPanel.classList.add('hidden');
    optionsContainer.innerHTML = '';
    
    const maxQs = currentQuestions.length;
    quizCounter.textContent = `Pregunta ${currentQuestionIndex + 1}/${maxQs}`;
    progressFill.style.width = `${((currentQuestionIndex) / maxQs) * 100}%`;

    const q = currentQuestions[currentQuestionIndex];
    questionText.textContent = q.pregunta;

    // Shuffle options to prevent pattern guessing? 
    // In this case, options are a,b,c,d. We will keep original letters or map them.
    const optionsObj = q.opciones || {};
    
    Object.keys(optionsObj).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span class="option-letter">${key})</span> <span>${optionsObj[key]}</span>`;
        
        // Handle Answer Click
        btn.onclick = () => handleAnswer(key, btn, q);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selectedKey, btnEl, questionObj) {
    if (isAnswered) return;
    isAnswered = true;

    const correctKey = String(questionObj.correcta).toLowerCase().trim();
    const selKey = String(selectedKey).toLowerCase().trim();
    
    const isCorrect = (selKey === correctKey);

    // Disable all options
    Array.from(optionsContainer.children).forEach(child => {
        child.disabled = true;
        // Verify which one was the real correct one to paint it green
        const childLett = child.querySelector('.option-letter').textContent.charAt(0).toLowerCase();
        if (childLett === correctKey) {
            child.classList.add('correct');
        }
    });

    if (isCorrect) {
        score++;
        feedbackTitle.textContent = "¡Correcto!";
        feedbackTitle.className = "feedback-title correct";
    } else {
        btnEl.classList.add('wrong');
        feedbackTitle.textContent = "Incorrecto";
        feedbackTitle.className = "feedback-title wrong";
    }

    const expText = questionObj.explicacion;
    feedbackText.textContent = (!expText || expText.trim() === "") ? "No hay explicación adicional para esta pregunta." : expText;
    feedbackPanel.classList.remove('hidden');
    
    // Update progress bar early
    progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
}

// Nav Buttons
btnNext.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
    } else {
        renderQuestion();
    }
};

btnBack.onclick = () => {
    if(confirm("¿Seguro que quieres salir? Perderás tu progreso en este test.")) {
        switchScreen(screenHome);
    }
};

btnHome.onclick = () => switchScreen(screenHome);

function showResults() {
    switchScreen(screenResult);
    scoreText.textContent = `${score}/${currentQuestions.length}`;
}
