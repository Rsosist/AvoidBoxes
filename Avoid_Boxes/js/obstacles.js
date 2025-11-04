import { ctx, canvas } from "./constants.js";

const obstacles = [];

function getRandomColor() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  const avg = (r + g + b) / 3;
  const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (avg < 156 || diff < 50) return getRandomColor();
  return `rgb(${r},${g},${b})`;
}

export function generateObstacle() {
  const width = 40;
  const height = 20;
  const x = Math.random() * (canvas.width - width);
  obstacles.push({
    x,
    y: 0,
    width,
    height,
    speed: 2 + Math.random() * 2, // 60fps 기준 속도
    color: getRandomColor()
  });
}

export function updateAndDrawObstacles(delta) {
  for (const ob of obstacles) {
    ob.y += ob.speed * delta;
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  }
}

export function cleanupObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].y >= canvas.height) obstacles.splice(i, 1);
  }
}

export function getObstacles() {
  return obstacles;
}
