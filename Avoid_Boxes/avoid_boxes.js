// ========================================
// Avoid Boxes 게임 JavaScript 코드
// 떨어지는 상자를 피하는 2D 게임
// ========================================

// ========================================
// Canvas 설정
// ========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// 플레이어 설정
// ========================================
let player = {
  x: 180,          // 플레이어의 x 좌표 (가로 위치)
  y: 450,          // 플레이어의 y 좌표 (세로 위치, 화면 하단 근처)
  width: 40,       // 플레이어의 너비 (픽셀)
  height: 20,      // 플레이어의 높이 (픽셀)
  speed: 5         // 플레이어의 이동 속도 (픽셀/키 입력)
};

// ========================================
// 게임 상태 관리 변수
// ========================================
let obstacles = [];       // 떨어지는 장애물들을 저장하는 배열
let gameOver = false;     // 게임 종료 여부를 나타내는 플래그
let startTime = Date.now();  // 게임 시작 시간 (밀리초)
let elapsedTime = 0;      // 경과 시간 (초)
let frameCount = 0;       // 프레임 카운터 (장애물 생성 주기 계산용)
let pv = false;

// ========================================
// 키보드 입력 처리
// ========================================
// 키보드 이벤트 리스너: 화살표 키로 플레이어 이동
// document.addEventListener("keydown", function(e) {
//   // 왼쪽 화살표 키: 플레이어를 왼쪽으로 이동
//   if (e.key === "ArrowLeft") player.x -= player.speed;
//   // 오른쪽 화살표 키: 플레이어를 오른쪽으로 이동
//   if (e.key === "ArrowRight") player.x += player.speed;
// });

let keys = {
  ArrowLeft : false,
  ArrowRight : false,
  ArrowUp : false
};

document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp") {
    keys[e.key] = true;
    e.preventDefault();
  }
});

document.addEventListener("keyup", function(e) {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp") {
    keys[e.key] = false;
  }
});

function movePlayer() {
  if (keys.ArrowLeft) {
    player.x -= player.speed;
  }

  if (keys.ArrowRight) {
    player.x += player.speed;
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}
// ========================================
// 플레이어 그리기 함수
// ========================================
function drawPlayer() {
  ctx.fillStyle = "black";  // 플레이어 색상: 검은색
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// ========================================
// 시간 표시 함수
// ========================================
function drawTime() {
  // 경과 시간 계산 (밀리초를 초로 변환)
  elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // 시간 텍스트 스타일 설정
  ctx.fillStyle = "black";      
  ctx.font = "24px Arial";      
  ctx.textAlign = "left";      
  
  // 화면 왼쪽 상단에 시간 표시
  ctx.fillText(`시간: ${elapsedTime}초`, 10, 30);
}

// ========================================
// 장애물 그리기 및 이동 함수
// ========================================
function drawObstacles() {
  // 모든 장애물을 순회하며 그리고 이동시킴
  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color;   
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);    // 장애물을 현재 위치에 그리기
    ob.y += ob.speed;    // 장애물을 아래로 이동 (y 좌표 증가)
  });
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;

  const average = (r + g + b) / 3;

  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

  if (average < 156 || maxDiff < 50) {
    return getRandomColor();
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// ========================================
// 새로운 장애물 생성 함수
// ========================================
function generateObstacle() {
  // 랜덤한 x 좌표 생성 (캔버스 너비 내에서, 장애물 크기를 고려)
  const x = Math.random() * (canvas.width - 40);

  obstacles.push({   // 새로운 장애물을 배열에 추가
    x: x,                           
    y: 0,                          
    width: 40,                        
    height: 20,                      
    speed: 2 + Math.random() * 2,
    color: getRandomColor() 
  });
}

// ========================================
// 충돌 감지 함수 (AABB 충돌 검사 : Axis-Aligned Bounding Box (축에 정렬된 경계 상자))
// ========================================
// 두 사각형이 겹치는지 확인하는 함수
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&      // rect1의 왼쪽이 rect2의 오른쪽보다 왼쪽에 있고
         rect1.x + rect1.width > rect2.x &&      // rect1의 오른쪽이 rect2의 왼쪽보다 오른쪽에 있고
         rect1.y < rect2.y + rect2.height &&     // rect1의 위쪽이 rect2의 아래쪽보다 위에 있고
         rect1.y + rect1.height > rect2.y;       // rect1의 아래쪽이 rect2의 위쪽보다 아래에 있으면
  // 위 4가지 조건이 모두 참이면 두 사각형이 겹침 (충돌)
}
// ========================================
// 포탑 & 총알 설정
// ========================================
// ========================================
// 포탑 & 총알 설정 (여러 개 관리)
// ========================================
let turrets = [
  {
    id: 1,
    x: canvas.width / 3,
    y: 50,
    width: 40,
    height: 20,
    aimTime: 120,
    fireDelay: 15,
    cooldown: 240,
    timer: 0,
    aiming: false,
    firing: false,
    targetX: null,
    active: true,
    shotsFired: 0,
    respawnTimer: 0
  }
];

let secondTurretTemplate = {
  id: 2,
  x: canvas.width * 2 / 3,
  y: 50,
  width: 40,
  height: 20,
  aimTime: 120,
  fireDelay: 15,
  cooldown: 240,
  timer: 0,
  aiming: false,
  firing: false,
  targetX: null,
  active: false,
  shotsFired: 0,
  respawnTimer: 0
};

let bullets = [];
let secondTurretActivated = false;


// ========================================
// 총알 생성 함수
// ========================================
function fireBullet(turret, targetX, targetY) {
  const angle = Math.atan2(targetY - turret.y, targetX - turret.x);
  const speed = 6;

  bullets.push({
    x: turret.x + turret.width / 2,
    y: turret.y,
    width: 8,
    height: 8,
    speedX: Math.cos(angle) * speed,
    speedY: Math.sin(angle) * speed,
    color: "red"
  });
}


// ========================================
// 총알 이동 및 그리기
// ========================================
function updateBullets() {
  bullets.forEach(b => {
    b.x += b.speedX;
    b.y += b.speedY;

    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // 화면 밖으로 나간 총알 제거
  bullets = bullets.filter(b => b.x >= 0 && b.x <= canvas.width && b.y <= canvas.height);
}

// ========================================
// 포탑 작동 로직
// ========================================
function updateTurrets() {
  turrets.forEach(turret => {
    // ❌ 비활성 상태면 리스폰 타이머 동작
    if (!turret.active) {
      if (turret.respawnTimer > 0) {
        turret.respawnTimer--;

        // 리스폰 완료
        if (turret.respawnTimer <= 0) {
          turret.x = Math.random() * (canvas.width - turret.width);
          turret.timer = 0;
          turret.shotsFired = 0;
          turret.active = true;

          // 🎲 리스폰 시 랜덤한 사격 방식 부여
          turret.guideStopBeforeFire =
            Math.random() < 0.5 ? 0 : 20 + Math.random() * 20;
        }
      }
      return;
    }

    // ✅ 활성 상태일 때
    turret.timer++;

    // === 조준 단계 ===
    if (turret.timer < turret.aimTime) {
      turret.aiming = true;
      turret.firing = false;

      const framesLeft = turret.aimTime - turret.timer;
      const guideStillActive = framesLeft > (turret.guideStopBeforeFire || 0);

      // 🔸 유도 중일 때만 플레이어 따라감
      if (guideStillActive) {
        turret.targetX = player.x + player.width / 2;
      }

      // 점선 색상 (빨강 = 유도 중 / 주황 = 고정)
      ctx.strokeStyle = guideStillActive
        ? "rgba(255, 0, 0, 0.8)"
        : "rgba(255, 140, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(turret.x + turret.width / 2, turret.y + turret.height / 2);
      ctx.lineTo(turret.targetX, player.y + player.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

    // === 첫 번째 발사 ===
    } else if (turret.timer === turret.aimTime) {
      turret.aiming = false;
      turret.firing = true;
      fireBullet(turret, turret.targetX, player.y);
      turret.shotsFired = (turret.shotsFired || 0) + 1;

    // === 두 번째 발사 ===
    } else if (turret.timer === turret.aimTime + turret.fireDelay) {
      fireBullet(turret, turret.targetX, player.y);
      turret.shotsFired++;

      // ⚡ 첫 번째 포탑이 두 번째 탄을 쏠 때 두 번째 포탑 등장
      if (turret.id === 1 && !secondTurretActivated) {
        let second = { ...secondTurretTemplate };
        second.active = true;
        second.shotsFired = 0;

        // 🎲 두 번째 포탑 생성 시 랜덤 사격 방식 부여
        second.guideStopBeforeFire =
          Math.random() < 0.5 ? 0 : 20 + Math.random() * 20;

        turrets.push(second);
        secondTurretActivated = true;
      }

      // 🔥 총 4발을 쏘면 사라지고 잠시 후 리스폰
      if (turret.shotsFired >= 4) {
        turret.active = false;
        turret.respawnTimer = 180; // 약 3초 후 재등장
      }
    }

    // 쿨타임 종료
    if (turret.timer >= turret.cooldown) {
      turret.timer = 0;
    }

    // 포탑 본체 그리기
    if (turret.active) {
      ctx.fillStyle = turret.id === 1 ? "gray" : "darkred";
      ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
    }
  });
}



// ========================================
// 게임 메인 루프 (업데이트 함수)
// ========================================
function update() {
  if (gameOver) return;  // 게임 오버 상태면 게임 루프 중단

  // 이전 프레임의 그림을 모두 지움 (캔버스 전체를 투명하게)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 게임 요소 그리기
  movePlayer();
  drawPlayer();      // 플레이어 그리기
  drawObstacles();   // 모든 장애물 그리기 및 이동
  drawTime();        // 시간 표시
  updateTurrets();
  updateBullets();


    // 총알과 플레이어 충돌 확인
  for (let b of bullets) {
    if (checkCollision(player, b)) {
      gameOver = true;
      alert(`Game Over! 생존 시간: ${elapsedTime}초`);
      return;
    }
  }

  // 모든 장애물에 대해 플레이어와의 충돌 확인
  for (let ob of obstacles) {
    if (checkCollision(player, ob)) {
          gameOver = true;  // 게임 종료 플래그 설정
          alert(`Game Over! 생존 시간: ${elapsedTime}초`);  // 최종 시간 표시
          return;  // 게임 루프 종료
        }
      }


  // 화면 밖으로 나간 장애물을 제거 (y 좌표가 캔버스 높이보다 작은 것만 유지)
  obstacles = obstacles.filter(ob => ob.y < canvas.height);
  // 프레임마다 카운터 1씩 증가
  frameCount++;

  // 30프레임(약 0.5초)마다 새로운 장애물 생성
  if (frameCount % 30 === 0) generateObstacle();

  // requestAnimationFrame: 브라우저에게 다음 프레임에 update 함수 호출 요청
  requestAnimationFrame(update);
}

// 게임 루프 시작
update();