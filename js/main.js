// main.js
import { canvas, ctx } from "./constants.js";
import { movePlayer, drawPlayer, player } from "./player.js";
import {
  generateObstacle,
  updateAndDrawObstacles,
  cleanupObstacles,
  getObstacles
} from "./obstacles.js";
import { updateAndDrawTurrets, resetTurrets, turrets } from "./turrets.js";
import {
  updateAndDrawBullets,
  cleanupBullets,
  getBullets
} from "./bullets.js";
import { checkCollision } from "./collision.js";

let gameOver = false;
let gameStarted = false;
let startTime = 0;
let elapsedTime = 0;
let frameCount = 0;
let lastTime = performance.now();
let reflectCount = 0;

const gameOverSound = new Audio("./assets/sound/gameover.mp3");
gameOverSound.volume = 0.3;

// 🟢 UI 컨테이너 (시작 버튼)
const uiContainer = document.createElement("div");
uiContainer.style.position = "absolute";
uiContainer.style.display = "flex";
uiContainer.style.flexDirection = "column";
uiContainer.style.justifyContent = "center";
uiContainer.style.alignItems = "center";
uiContainer.style.fontFamily = "Orbitron, sans-serif";
uiContainer.style.color = "white";
uiContainer.style.userSelect = "none";
uiContainer.style.zIndex = "20";        // 캔버스 위로
uiContainer.style.pointerEvents = "none"; // 컨테이너는 클릭 막고
document.body.appendChild(uiContainer);

// 🟢 시작 버튼
const startBtn = document.createElement("button");
startBtn.textContent = "Start Game";
startBtn.style.fontSize = "28px";
startBtn.style.padding = "12px 32px";
startBtn.style.border = "2px solid cyan";
startBtn.style.background = "black";
startBtn.style.color = "cyan";
startBtn.style.borderRadius = "8px";
startBtn.style.cursor = "pointer";
startBtn.style.transition = "all 0.2s";
startBtn.onmouseenter = () => (startBtn.style.background = "rgba(0,255,255,0.1)");
startBtn.onmouseleave = () => (startBtn.style.background = "black");
startBtn.style.pointerEvents = "auto"; // 🟢 버튼은 클릭 가능
uiContainer.appendChild(startBtn);

// 🟢 키 설명 버튼 (캔버스 내부 기준)
const rect = canvas.getBoundingClientRect();
const helpBtn = document.createElement("div");
helpBtn.textContent = "?";
helpBtn.style.position = "absolute";
helpBtn.style.left = `${rect.left + rect.width - 60}px`;
helpBtn.style.top = `${rect.top + rect.height - 60}px`;
helpBtn.style.width = "40px";
helpBtn.style.height = "40px";
helpBtn.style.border = "2px solid cyan";
helpBtn.style.borderRadius = "50%";
helpBtn.style.display = "flex";
helpBtn.style.justifyContent = "center";
helpBtn.style.alignItems = "center";
helpBtn.style.color = "cyan";
helpBtn.style.fontSize = "22px";
helpBtn.style.cursor = "pointer";
helpBtn.style.background = "rgba(0,0,0,0.5)";
helpBtn.style.transition = "all 0.2s";
document.body.appendChild(helpBtn);

const helpPopup = document.createElement("div");
helpPopup.style.position = "absolute";
helpPopup.style.left = `${rect.left + rect.width - 220}px`;
helpPopup.style.top = `${rect.top + rect.height - 130}px`;
helpPopup.style.background = "rgba(0,0,0,0.8)";
helpPopup.style.border = "2px solid cyan";
helpPopup.style.padding = "10px 14px";
helpPopup.style.borderRadius = "10px";
helpPopup.style.color = "white";
helpPopup.style.fontSize = "14px";
helpPopup.style.display = "none";
helpPopup.style.textAlign = "left";
helpPopup.innerHTML = `
<b>키 설명</b><br>
⬅️ ➡️ 이동<br>
SPACE 탄 반사<br>
`;
document.body.appendChild(helpPopup);

helpBtn.addEventListener("mouseenter", () => (helpPopup.style.display = "block"));
helpBtn.addEventListener("mouseleave", () => (helpPopup.style.display = "none"));

// 🟦 점수 박스 (캔버스 오른쪽 바깥쪽)
const scoreBox = document.createElement("div");
scoreBox.style.position = "absolute";
scoreBox.style.left = `${rect.left + canvas.width}px`; // 오른쪽 선과 겹치도록
scoreBox.style.top = `${rect.top + 10}px`;
scoreBox.style.width = "120px";
scoreBox.style.height = "100px";
scoreBox.style.background = "rgba(0,0,0,0.6)";
scoreBox.style.border = "2px solid cyan";
scoreBox.style.borderLeft = "none"; // 겹치는 쪽 선 제거
scoreBox.style.color = "white";
scoreBox.style.display = "flex";
scoreBox.style.alignItems = "center";
scoreBox.style.justifyContent = "center";
scoreBox.style.fontFamily = "Orbitron, sans-serif";
scoreBox.style.fontSize = "18px";
scoreBox.textContent = "0";
document.body.appendChild(scoreBox);

// 🧩 점수 박스 위치 갱신 함수
function updateUIPositions() {
  const rect = canvas.getBoundingClientRect();

  // 🔷 시작 UI 오버레이를 캔버스 영역에 정확히 덮기
  uiContainer.style.left = `${rect.left}px`;
  uiContainer.style.top = `${rect.top}px`;
  uiContainer.style.width = `${rect.width}px`;
  uiContainer.style.height = `${rect.height}px`;

  // 🔷 점수 박스: 캔버스 오른쪽 바깥쪽 (겹치도록)
  scoreBox.style.left = `${rect.right}px`;     // rect.left + rect.width
  scoreBox.style.top  = `${rect.top + 10}px`;

  // 🔷 도움말 버튼/팝업: 캔버스 내부 오른쪽 아래
  helpBtn.style.left    = `${rect.right - 60}px`;
  helpBtn.style.top     = `${rect.bottom - 60}px`;
  helpPopup.style.left  = `${rect.right - 220}px`;
  helpPopup.style.top   = `${rect.bottom - 130}px`;
}
// 초기 실행 시 한 번 호출
updateUIPositions();

// 창 크기 변경되거나 스크롤될 때마다 위치 갱신
window.addEventListener("resize", updateUIPositions);
window.addEventListener("scroll", updateUIPositions);
window.addEventListener("orientationchange", updateUIPositions);

// 🟢 시작 버튼 클릭 시
startBtn.addEventListener("click", () => {
  uiContainer.remove();  // 중앙 오버레이 제거
  helpBtn.remove();
  helpPopup.remove();
  gameStarted = true;
  startGame();
});

export function addReflectCount(amount) {
  reflectCount += amount;
}

// 🧩 게임 초기화
function startGame() {
  gameOver = false;
  elapsedTime = 0;
  frameCount = 0;
  reflectCount = 0;
  startTime = Date.now();
  lastTime = performance.now();

  // 💥 탄, 장애물, 포탑 초기화
  getBullets().length = 0;
  getObstacles().length = 0;
  if (typeof resetTurrets === "function") resetTurrets();
  else turrets.forEach(t => {
    t.active = false;
    t.visible = false;
  });

  requestAnimationFrame(update);
}

// 🕒 기존처럼 왼쪽 위 시간 표시 (.초까지)
function drawTime() {
  elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
  ctx.fillStyle = "black";
  ctx.font = "22px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`시간: ${elapsedTime}s`, 10, 30);

  // 점수는 소수점 올림 정수로 표시
  const score = Math.ceil(elapsedTime) + reflectCount;
  scoreBox.textContent = score.toString();
}

// 🧩 재시작 처리 (캔버스 클릭)
canvas.addEventListener("click", () => {
  if (gameOver) startGame();
});

// 🧠 게임 루프
function update(now = performance.now()) {
  if (!gameStarted || gameOver) return;

  const delta = (now - lastTime) / (1000 / 60);
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer(delta);
  drawPlayer();
  updateAndDrawObstacles(delta);
  updateAndDrawTurrets(delta, parseFloat(elapsedTime));
  updateAndDrawBullets(delta);
  drawTime();

  // 충돌 검사
  for (const b of getBullets()) {
    if (checkCollision(player, b)) {
      handleGameOver();
      return;
    }
  }
  for (const ob of getObstacles()) {
    if (checkCollision(player, ob)) {
      handleGameOver();
      return;
    }
  }

  cleanupObstacles();
  cleanupBullets();

  frameCount += delta;
  if (frameCount >= 30) {
    generateObstacle();
    frameCount = 0;
  }

  requestAnimationFrame(update);
}

// 🟥 게임 오버 처리
function handleGameOver() {
  gameOver = true;

  let opacity = 0;
  let increasing = true;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});

  const blinkInterval = setInterval(() => {
    if (!gameOver) {
      clearInterval(blinkInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.save();
    ctx.font = "bold 38px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1줄: Game Over
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);

    // 2줄: Click to Restart
    ctx.font = "28px Orbitron, sans-serif";
    ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 25);

    ctx.restore();

    if (increasing) opacity += 0.05;
    else opacity -= 0.05;
    if (opacity >= 1) increasing = false;
    if (opacity <= 0) increasing = true;
  }, 50);
}

