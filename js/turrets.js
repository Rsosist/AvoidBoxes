// turrets.js
import { ctx, canvas } from "./constants.js";
import { player } from "./player.js";
import { fireBullet } from "./bullets.js";

export let turrets = [];

// 상태 변수들 (리셋 시 초기화)
let secondCreated = false;
let thirdAllowed = false, fourthAllowed = false, fifthAllowed = false;
let thirdCreated = false, fourthCreated = false, fifthCreated = false;

function createTurret(id, x, y) {
  return {
    id,
    x,
    y,
    width: 40,
    height: 20,
    aimTime: 120,    // 조준 시간 (프레임 기준)
    cooldown: 240,   // 발사 간격
    timer: 0,
    targetX: null,
    active: true,
    visible: false,  // 기본은 보이지 않음. start turret만 visible=true로 만듦
    shotsFired: 0,
    respawnTimer: 0,
    guideStopBeforeFire: Math.random() < 0.5 ? 0 : 20 + Math.random() * 20,
    hasFired: false,
    spawnDelay: 0,   // 등장 딜레이용 (프레임 단위)
  };
}

// 🟢 초기화 함수: 모든 상태 초기화 + 1번 포탑만 생성(visible)
export function resetTurrets() {
  turrets.length = 0;

  // 상태 변수 초기화
  secondCreated = false;
  thirdAllowed = false; fourthAllowed = false; fifthAllowed = false;
  thirdCreated = false; fourthCreated = false; fifthCreated = false;

  // 1번 포탑만 생성 (초기 시작 포탑)
  const baseY = 50;
  const x1 = Math.round(canvas.width / 2 - 100);
  const t1 = createTurret(1, x1, baseY);
  t1.visible = true; // 시작 시 보이는 포탑은 1번만
  turrets.push(t1);
}

// (optional) 자동 호출하지 않음 — main.js의 startGame()에서 resetTurrets() 호출하세요

export function updateAndDrawTurrets(delta, elapsedSeconds = 0) {
  // 시간 조건으로 다음 포탑 "활성 허용" 플래그
  if (elapsedSeconds > 10) thirdAllowed = true;
  if (elapsedSeconds > 20) fourthAllowed = true;
  if (elapsedSeconds > 40) fifthAllowed = true;

  // 각 포탑 업데이트
  turrets.forEach((turret) => {
    // 리스폰 대기(비활성 상태) 처리
    if (!turret.active) {
      if (turret.respawnTimer > 0) {
        turret.respawnTimer -= delta;
        if (turret.respawnTimer <= 0) {
          turret.x = Math.random() * (canvas.width - turret.width);
          turret.timer = 0;
          turret.shotsFired = 0;
          turret.hasFired = false;
          turret.active = true;
          turret.visible = true;
          turret.guideStopBeforeFire =
            Math.random() < 0.5 ? 0 : 20 + Math.random() * 20;
        }
      }
      return;
    }

    // 등장 딜레이 처리 (spawnDelay > 0 이면 visible=false 상태에서 대기)
    if (!turret.visible) {
      if (turret.spawnDelay > 0) {
        turret.spawnDelay -= delta;
        if (turret.spawnDelay <= 0) turret.visible = true;
      }
      return;
    }

    // 정상 작동: 타이머 누적
    turret.timer += delta;

    // 조준선 표시
    if (turret.timer < turret.aimTime) {
      const framesLeft = turret.aimTime - turret.timer;
      const guideStillActive = framesLeft > (turret.guideStopBeforeFire || 0);
      if (guideStillActive) turret.targetX = player.x + player.width / 2;

      ctx.strokeStyle = guideStillActive ? "rgba(255,0,0,0.8)" : "rgba(255,140,0,0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(turret.x + turret.width / 2, turret.y + turret.height / 2);
      ctx.lineTo(turret.targetX || turret.x, player.y + player.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 발사 시 (aimTime 도달)
    if (!turret.hasFired && turret.timer >= turret.aimTime) {
      fireBullet(turret, turret.targetX || player.x + player.width / 2, player.y);
      turret.shotsFired++;
      turret.hasFired = true;

      // === 트리거 기반 순차 등장 로직 ===
      // 1 -> 2
      if (turret.id === 1 && !secondCreated) {
        const t2 = createTurret(2, Math.round(canvas.width * 2 / 3), 50);
        t2.visible = false;
        t2.spawnDelay = 60; // 1초 딜레이
        turrets.push(t2);
        secondCreated = true;
      }
      // 2 -> 3 (시간 조건 확인)
      else if (turret.id === 2 && thirdAllowed && !thirdCreated) {
        const t3 = createTurret(3, Math.round(canvas.width / 4), 80);
        t3.visible = false;
        t3.spawnDelay = 60;
        turrets.push(t3);
        thirdCreated = true;
      }
      // 3 -> 4
      else if (turret.id === 3 && fourthAllowed && !fourthCreated) {
        const t4 = createTurret(4, Math.round(canvas.width * 3 / 4), 80);
        t4.visible = false;
        t4.spawnDelay = 60;
        turrets.push(t4);
        fourthCreated = true;
      }
      // 4 -> 5 (optional)
      else if (turret.id === 4 && fifthAllowed && !fifthCreated) {
        const t5 = createTurret(5, Math.round(canvas.width * 2 / 3), 100);
        t5.visible = false;
        t5.spawnDelay = 60;
        turrets.push(t5);
        fifthCreated = true;
      }
    }

    // 쿨다운 리셋
    if (turret.timer >= turret.cooldown) {
      turret.timer = 0;
      turret.hasFired = false;
    }

    // 2발 쏘면 사라짐
    if (turret.shotsFired >= 2) {
      turret.active = false;
      turret.visible = false;
      turret.respawnTimer = 180; // 3초 대기 후 재등장
    }

    // 포탑 그리기
    if (turret.visible) {
      ctx.fillStyle = ["gray", "darkred", "purple", "navy", "teal"][turret.id - 1] || "gray";
      ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
    }
  });
}

