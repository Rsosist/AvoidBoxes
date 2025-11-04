// bullets.js
import { ctx, canvas } from "./constants.js";
import { player } from "./player.js";
import { turrets } from "./turrets.js";
import { addReflectCount } from "./main.js";

const bullets = [];

export function fireBullet(turret, targetX, targetY) {
  const angle = Math.atan2(targetY - turret.y, targetX - turret.x);
  const speed = 8; // 60fps 기준 속도
  bullets.push({
    x: turret.x + turret.width / 2,
    y: turret.y,
    width: 8,
    height: 8,
    speedX: Math.cos(angle) * speed,
    speedY: Math.sin(angle) * speed,
    color: "red",
    isReflected: false
  });
}

export function updateAndDrawBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    // 이동
    b.x += b.speedX * delta;
    b.y += b.speedY * delta;

    // 🟢 방패 판정
    if (!b.isReflected && player.shieldActive) {
      const shieldY = player.y - 12;
      const shieldH = 10;

      const hitShield =
        b.y + b.height >= shieldY &&
        b.y <= shieldY + shieldH &&
        b.x + b.width > player.x &&
        b.x < player.x + player.width;

      if (hitShield) {
        // 반사 성공!
        b.isReflected = true;
        b.color = "cyan";
        addReflectCount(5);

        // 🎯 활성 포탑 중 무작위 하나 조준
        const activeTurrets = turrets.filter(t => t.active && t.visible);
        if (activeTurrets.length > 0) {
          const target = activeTurrets[Math.floor(Math.random() * activeTurrets.length)];

          // 각도 재계산 (포탑 중심 향해)
          const angle = Math.atan2(
            (target.y + target.height / 2) - b.y,
            (target.x + target.width / 2) - b.x
          );
          const speed = Math.sqrt(b.speedX * b.speedX + b.speedY * b.speedY);

          b.speedX = Math.cos(angle) * speed;
          b.speedY = Math.sin(angle) * speed;
        } else {
          // 포탑이 없다면 단순 위로 반사
          b.speedY *= -1;
        }
      }
    }

    // 🟢 반사탄이 포탑에 맞으면 포탑 제거
    if (b.isReflected) {
      for (let j = turrets.length - 1; j >= 0; j--) {
        const t = turrets[j];
        if (
          t.active &&
          b.x < t.x + t.width &&
          b.x + b.width > t.x &&
          b.y < t.y + t.height &&
          b.y + b.height > t.y
        ) {
          t.active = false;
          t.visible = false;
          t.respawnTimer = 180; // 3초 후 재등장
          bullets.splice(i, 1);
          break;
        }
      }
    }

    // 화면 밖 제거
    if (
      b.x < 0 ||
      b.x > canvas.width ||
      b.y > canvas.height ||
      b.y < -50
    ) {
      bullets.splice(i, 1);
      continue;
    }

    // 그리기
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }
}

export function cleanupBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (
      b.x < 0 ||
      b.x > canvas.width ||
      b.y > canvas.height ||
      b.y < -50
    ) {
      bullets.splice(i, 1);
    }
  }
}

export function getBullets() {
  return bullets;
}
