// player.js
import { DEFAULT_PLAYER, canvas, ctx } from "./constants.js";
import { keys } from "./input.js";

// 쿨타임 완료 사운드
const reflectReadySound = new Audio("./assets/sound/ready.mp3");
reflectReadySound.volume = 0.3;

export const player = { 
  ...DEFAULT_PLAYER,
  reflectReady: true,
  reflectCooldown: 0,
  shieldActive: false,
  shieldTimer: 0,
  playedReadySound: false
};

export function movePlayer(delta) {
  // 이동
  if (keys.ArrowLeft) player.x -= player.speed * delta;
  if (keys.ArrowRight) player.x += player.speed * delta;

  // ↑키로 방패 발동
  if (player.reflectReady && keys.Space) {
    player.reflectReady = false;
    player.reflectCooldown = 300; // 약 5초
    player.shieldActive = true;
    player.shieldTimer = 20; // 약 0.15초
    player.playedReadySound = false;
  }

  // 방패 지속 시간
  if (player.shieldActive) {
    player.shieldTimer -= delta;
    if (player.shieldTimer <= 0) player.shieldActive = false;
  }

  // 쿨타임 감소 + 완료 시 효과음
  if (!player.reflectReady) {
    player.reflectCooldown -= delta;
    if (player.reflectCooldown <= 0) {
      player.reflectReady = true;
      player.reflectCooldown = 0;
      if (!player.playedReadySound) {
        reflectReadySound.currentTime = 0;
        reflectReadySound.play().catch(() => {});
        player.playedReadySound = true;
      }
    }
  }

  // 경계 처리
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
}

export function drawPlayer() {
  ctx.fillStyle = "black";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (player.shieldActive) {
    ctx.fillStyle = "rgba(0,255,255,0.3)";
    ctx.fillRect(player.x, player.y - 12, player.width, 10);
  }

  // 쿨타임 표시 (오른쪽 하단)
  ctx.font = "16px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  const seconds = Math.ceil(player.reflectCooldown / 60);

  if (player.reflectReady) {
    ctx.fillStyle = "blue";
    ctx.fillText("Reflect Ready", canvas.width - 20, canvas.height - 20);
  } else {
    ctx.fillStyle = "red";
    ctx.fillText(`Cooldown: ${seconds}s`, canvas.width - 20, canvas.height - 20);
  }
}
