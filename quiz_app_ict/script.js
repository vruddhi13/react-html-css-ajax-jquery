const quizData = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Text Machine Language"],
        answer: 0
    },
    {
        question: "Which language is used for styling web pages?",
        options: ["HTML", "CSS", "JavaScript", "Python"],
        answer: 1
    },
    {
        question: "What does CSS stand for?",
        options: ["Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets", "Computer Style Sheets"],
        answer: 1
    },
    {
        question: "Which symbol is used for comments in HTML?",
        options: ["//", "/* */", "<!-- -->", "#"],
        answer: 2
    },
    {
        question: "Which of these is not a JavaScript framework?",
        options: ["React", "Angular", "Vue", "Bootstrap"],
        answer: 3
    }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;

const startBtn = document.getElementById('start-btn');
const quiz = document.getElementById('quiz');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answer-buttons');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    startScreen.classList.add('hidden');
    quiz.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    feedbackEl.textContent = '';
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuiz = quizData[currentQuestion];
    questionEl.textContent = currentQuiz.question;
    
    currentQuiz.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('answer-btn');
        button.addEventListener('click', () => selectAnswer(index));
        answerButtonsEl.appendChild(button);
    });
    
    updateScore();
}

function resetState() {
    while (answerButtonsEl.firstChild) {
        answerButtonsEl.removeChild(answerButtonsEl.firstChild);
    }
    feedbackEl.textContent = '';
    Array.from(document.querySelectorAll('.answer-btn')).forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
    });
}

function selectAnswer(selectedIndex) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = selectedIndex;
    const buttons = document.querySelectorAll('.answer-btn');
    const isCorrect = selectedIndex === quizData[currentQuestion].answer;
    
    buttons[selectedIndex].classList.add('selected');
    
    if (isCorrect) {
        feedbackEl.textContent = 'Correct!';
        buttons[selectedIndex].classList.add('correct');
        score++;
    } else {
        feedbackEl.textContent = 'Incorrect!';
        buttons[selectedIndex].classList.add('incorrect');
        buttons[quizData[currentQuestion].answer].classList.add('correct');
    }
    
    updateScore();
    nextBtn.classList.remove('hidden');
}

function updateScore() {
    scoreEl.textContent = `Score: ${score}/${quizData.length}`;
}

function handleNextQuestion() {
    currentQuestion++;
    selectedAnswer = null;
    
    if (currentQuestion < quizData.length) {
        showQuestion();
        nextBtn.classList.add('hidden');
        feedbackEl.textContent = '';
    } else {
        endQuiz();
    }
}

function endQuiz() {
    quiz.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreEl.textContent = `You scored ${score} out of ${quizData.length}!`;
}

nextBtn.addEventListener('click', handleNextQuestion);
startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});