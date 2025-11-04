// 키 입력 관리 (플레이어 이동만 처리)
// 다른 모듈에서 keys 상태를 참조할 수 있도록 export
export const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        keys.Space = true;
        e.preventDefault();
        return;
    }
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        keys.Space = false;
        return;
    }
    if (e.key in keys) {
        keys[e.key] = false;
    }
});
