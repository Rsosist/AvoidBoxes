export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

// 플레이어 초기값(필요 시 다른 모듈에서 변경 가능)
export const DEFAULT_PLAYER = {
  x: 180,
  y: 450,
  width: 40,
  height: 20,
  speed: 5
};
