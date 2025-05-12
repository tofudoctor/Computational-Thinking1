// 🔥 Firebase 初始化（請換成你自己的）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_AUTHDOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_STORAGE_BUCKET",
  messagingSenderId: "XXXX",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const scoresCollection = db.collection("snake_scores");

// 🐍 遊戲原本變數與初始化邏輯
const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const modal = document.getElementById('game-over-modal');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const nameInput = document.getElementById('player-name');
const leaderboard = document.getElementById('leaderboard');

const boardSize = 20;
let cells = [];
let snake = [];
let direction = { x: 0, y: 0 };
let food = null;
let score = 0;
let gameInterval = null;
let gameStarted = false;

function initGame() {
  board.innerHTML = '';
  cells = [];
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  food = null;
  score = 0;
  scoreEl.textContent = '分數：0';
  gameStarted = false;
  clearInterval(gameInterval);

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
    cells.push(cell);
  }

  spawnFood();
  draw();
  loadLeaderboard(); // ⚠️ 讀排行榜
}

function getIndex(x, y) {
  return y * boardSize + x;
}

function draw() {
  cells.forEach(cell => cell.className = 'cell');
  snake.forEach(part => cells[getIndex(part.x, part.y)].classList.add('snake'));
  if (food) cells[getIndex(food.x, food.y)].classList.add('food');
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));
  food = newFood;
}

function move() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (
    head.x < 0 || head.y < 0 || head.x >= boardSize || head.y >= boardSize ||
    snake.some(part => part.x === head.x && part.y === head.y)
  ) {
    clearInterval(gameInterval);
    showGameOver();
    return;
  }

  snake.unshift(head);
  if (food && head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = '分數：' + score;
    spawnFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameLoop() {
  move();
}

document.addEventListener('keydown', e => {
  if (!gameStarted) {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, 150);
  }

  switch (e.key) {
    case 'ArrowUp': if (direction.y === 0) direction = { x: 0, y: -1 }; break;
    case 'ArrowDown': if (direction.y === 0) direction = { x: 0, y: 1 }; break;
    case 'ArrowLeft': if (direction.x === 0) direction = { x: -1, y: 0 }; break;
    case 'ArrowRight': if (direction.x === 0) direction = { x: 1, y: 0 }; break;
  }
});

function showGameOver() {
  finalScore.textContent = `你得到了 ${score} 分！`;
  modal.style.display = 'flex';
}

// ✅ 儲存分數到 Firebase
async function saveScore(name, score) {
  if (!name) name = '匿名';
  await scoresCollection.add({ name, score, timestamp: Date.now() });
  loadLeaderboard();
}

// ✅ 顯示排行榜
async function loadLeaderboard() {
  const snapshot = await scoresCollection
    .orderBy('score', 'desc')
    .limit(5)
    .get();

  leaderboard.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.name} - ${data.score} 分`;
    leaderboard.appendChild(li);
  });
}

// 🔁 點按重新開始
restartBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  modal.style.display = 'none';
  saveScore(name, score);
  initGame();
});

initGame();
