const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const modal = document.getElementById('game-over-modal');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const boardSize = 20;
let cells = [];
let snake = [];
let direction = { x: 0, y: 0 };
let food = null;
let score = 0;
let gameInterval = null;
let gameStarted = false;

function initGame() {
  // 重置狀態
  board.innerHTML = '';
  cells = [];
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  food = null;
  score = 0;
  scoreEl.textContent = '分數：0';
  gameStarted = false;
  clearInterval(gameInterval);

  // 建立格子
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
    cells.push(cell);
  }

  spawnFood();
  draw();
}

function getIndex(x, y) {
  return y * boardSize + x;
}

function draw() {
  cells.forEach(cell => cell.className = 'cell');
  snake.forEach(part => cells[getIndex(part.x, part.y)].classList.add('snake'));
  if (food) {
    cells[getIndex(food.x, food.y)].classList.add('food');
  }
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

  // 撞牆或撞自己
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

restartBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  initGame();
});

initGame();
