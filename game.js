const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const flapBtn = document.querySelector("#flapBtn");
const leftBtn = document.querySelector("#leftBtn");
const rightBtn = document.querySelector("#rightBtn");
const modeButtons = [...document.querySelectorAll(".mode")];

const settings = {
  easy: { gravity: 0.34, boost: -7.4, speed: 2.45, gap: 250, spawn: 116, label: "Easy" },
  medium: { gravity: 0.42, boost: -7.9, speed: 3.2, gap: 210, spawn: 96, label: "Medium" },
  hard: { gravity: 0.5, boost: -8.35, speed: 4.05, gap: 174, spawn: 78, label: "Hard" },
};

const road = {
  left: 54,
  right: canvas.width - 54,
  top: 0,
  bottom: canvas.height,
};

const laneCount = 3;
const laneWidth = (road.right - road.left) / laneCount;
const laneCenters = Array.from({ length: laneCount }, (_, i) => road.left + laneWidth * (i + 0.5));
const car = {
  lane: 1,
  x: laneCenters[1],
  y: 430,
  w: 48,
  h: 76,
  vy: 0,
};

let mode = "easy";
let obstacles = [];
let frame = 0;
let score = 0;
let best = Number(localStorage.getItem("flappy-lane-racer-best") || 0);
let running = false;
let paused = false;
let gameOver = false;
let lastTime = 0;
let shake = 0;

bestEl.textContent = best;

function reset() {
  obstacles = [];
  frame = 0;
  score = 0;
  car.lane = 1;
  car.x = laneCenters[1];
  car.y = 430;
  car.vy = 0;
  running = true;
  paused = false;
  gameOver = false;
  scoreEl.textContent = "0";
  startBtn.textContent = "Restart";
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === nextMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  reset();
}

function boost() {
  if (!running || gameOver) {
    reset();
  }
  if (!paused) {
    car.vy = settings[mode].boost;
  }
}

function switchLane(direction) {
  if (!running || paused || gameOver) return;
  car.lane = Math.max(0, Math.min(laneCount - 1, car.lane + direction));
}

function spawnObstacle() {
  const openLane = Math.floor(Math.random() * laneCount);
  const pattern = Math.random();
  const blocked = [];

  for (let lane = 0; lane < laneCount; lane += 1) {
    if (lane !== openLane) blocked.push(lane);
  }

  if (mode === "easy" && pattern < 0.42) {
    blocked.pop();
  }

  if (mode === "hard" && pattern > 0.74) {
    blocked.push(openLane);
    blocked.splice(Math.floor(Math.random() * blocked.length), 1);
  }

  obstacles.push({
    y: -100,
    lanes: blocked,
    passed: false,
    hue: 8 + Math.random() * 24,
  });
}

function update() {
  if (!running || paused || gameOver) return;

  const config = settings[mode];
  frame += 1;
  car.vy += config.gravity;
  car.y += car.vy;
  car.x += (laneCenters[car.lane] - car.x) * 0.24;

  if (frame % config.spawn === 0) {
    spawnObstacle();
  }

  obstacles.forEach((obstacle) => {
    obstacle.y += config.speed;
    if (!obstacle.passed && obstacle.y > car.y + car.h) {
      obstacle.passed = true;
      score += 1;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        localStorage.setItem("flappy-lane-racer-best", String(best));
        bestEl.textContent = best;
      }
    }
  });

  obstacles = obstacles.filter((obstacle) => obstacle.y < canvas.height + 120);

  const hitCeiling = car.y < 24;
  const hitRoad = car.y + car.h > canvas.height - 18;
  if (hitCeiling || hitRoad || hitsTraffic()) {
    gameOver = true;
    running = false;
    shake = 14;
    startBtn.textContent = "Play Again";
  }
}

function hitsTraffic() {
  return obstacles.some((obstacle) => {
    if (!obstacle.lanes.includes(car.lane)) return false;
    const carTop = car.y;
    const carBottom = car.y + car.h;
    const trafficTop = obstacle.y;
    const trafficBottom = obstacle.y + 92;
    return carBottom > trafficTop + 10 && carTop < trafficBottom - 10;
  });
}

function drawRoad() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#33415f");
  gradient.addColorStop(1, "#1e293f");
  ctx.fillStyle = gradient;
  roundRect(road.left, road.top - 8, road.right - road.left, canvas.height + 16, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 3;
  ctx.setLineDash([26, 24]);
  for (let i = 1; i < laneCount; i += 1) {
    const x = road.left + laneWidth * i;
    ctx.beginPath();
    ctx.moveTo(x, -40 + (frame * settings[mode].speed) % 50);
    ctx.lineTo(x, canvas.height + 40);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = "#121a2b";
  ctx.fillRect(0, 0, road.left - 8, canvas.height);
  ctx.fillRect(road.right + 8, 0, canvas.width - road.right, canvas.height);
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y + car.h / 2);
  ctx.rotate(Math.max(-0.16, Math.min(0.16, car.vy * 0.018)));

  ctx.fillStyle = "#39d98a";
  roundRect(-car.w / 2, -car.h / 2, car.w, car.h, 10);
  ctx.fill();

  ctx.fillStyle = "#102019";
  roundRect(-15, -22, 30, 26, 6);
  ctx.fill();

  ctx.fillStyle = "#f7fbff";
  roundRect(-18, 20, 36, 12, 5);
  ctx.fill();

  ctx.fillStyle = "#0b101d";
  ctx.fillRect(-car.w / 2 - 5, -25, 8, 20);
  ctx.fillRect(car.w / 2 - 3, -25, 8, 20);
  ctx.fillRect(-car.w / 2 - 5, 18, 8, 20);
  ctx.fillRect(car.w / 2 - 3, 18, 8, 20);
  ctx.restore();
}

function drawTraffic() {
  obstacles.forEach((obstacle) => {
    obstacle.lanes.forEach((lane) => {
      const x = laneCenters[lane];
      ctx.save();
      ctx.translate(x, obstacle.y + 46);
      ctx.fillStyle = `hsl(${obstacle.hue}, 88%, 58%)`;
      roundRect(-26, -46, 52, 92, 9);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.78)";
      roundRect(-16, -28, 32, 20, 5);
      ctx.fill();

      ctx.fillStyle = "#151923";
      ctx.fillRect(-30, -26, 8, 22);
      ctx.fillRect(22, -26, 8, 22);
      ctx.fillRect(-30, 18, 8, 22);
      ctx.fillRect(22, 18, 8, 22);
      ctx.restore();
    });
  });
}

function drawHudMessage() {
  if (running && !paused && !gameOver) return;

  ctx.save();
  ctx.fillStyle = "rgba(7, 12, 24, 0.68)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f7fbff";
  ctx.font = "900 34px system-ui";

  if (gameOver) {
    ctx.fillText("Crash!", canvas.width / 2, 292);
    ctx.font = "700 18px system-ui";
    ctx.fillText("Press Start, Space, or tap Boost", canvas.width / 2, 330);
  } else if (paused) {
    ctx.fillText("Paused", canvas.width / 2, 306);
  } else {
    ctx.fillText("Flappy Lane Racer", canvas.width / 2, 282);
    ctx.font = "700 18px system-ui";
    ctx.fillText("Pick a lane, boost through traffic", canvas.width / 2, 322);
  }

  ctx.font = "800 15px system-ui";
  ctx.fillStyle = "#39d98a";
  ctx.fillText(`${settings[mode].label} mode`, canvas.width / 2, 366);
  ctx.restore();
}

function draw() {
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    shake *= 0.82;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  drawTraffic();
  drawCar();
  ctx.restore();
  drawHudMessage();
}

function loop(time) {
  const delta = time - lastTime;
  lastTime = time;
  if (delta < 80) update();
  draw();
  requestAnimationFrame(loop);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

startBtn.addEventListener("click", reset);
pauseBtn.addEventListener("click", () => {
  if (!running || gameOver) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});
flapBtn.addEventListener("click", boost);
leftBtn.addEventListener("click", () => switchLane(-1));
rightBtn.addEventListener("click", () => switchLane(1));

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "Space" || event.code === "ArrowUp") boost();
  if (event.code === "ArrowLeft") switchLane(-1);
  if (event.code === "ArrowRight") switchLane(1);
  if (event.code === "KeyP") pauseBtn.click();
});

draw();
requestAnimationFrame(loop);
