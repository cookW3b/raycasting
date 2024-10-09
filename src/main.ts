import App from './App';
import './style.css'
import Vec2 from './Vec2';

const _DEBUG = true;

const FOV = 90 * (Math.PI / 180);
const PLANE = 0.5;
const RAY_COUNT = 100;

const GAME_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

const GRID_COLS = GAME_MAP.length;
const GRID_ROWS = GAME_MAP[0].length;

const app = new App("game");
app.ctxScale.set(app.width / GRID_COLS, app.height / GRID_ROWS);

let isGameMapOpened = true;
const playerPos = new Vec2((GRID_COLS / 2) - 0.7, (GRID_ROWS / 2) - 0.5);
let playerDirection = new Vec2(0, 0);
let playerVelocity = 0;
let playerAngle = Math.PI;

updatePlayerDirection();
setupKeyboardHandlers();

app.onUpdate(() => {
  const cX = Math.cos(playerAngle) * playerVelocity;
  const cY = Math.sin(playerAngle) * playerVelocity;
  playerPos.x -= cX;
  playerPos.y -= cY;

  if (GAME_MAP[Math.trunc(playerPos.x)][Math.trunc(playerPos.y)] > 0) {
    playerPos.x += cX;
    playerPos.y += cY;
  }

  if (isGameMapOpened) {
    drawGrid();
    // drawSingleRay();
    drawRays();
    drawPlayer();
  }
});

function updatePlayerDirection() {
  playerDirection = playerDirection.set(
    Math.cos(playerAngle),
    Math.sin(playerAngle)
  ).unit();
}

function setupKeyboardHandlers() {
  window.addEventListener(`keydown`, (event) => {
    const e = event as KeyboardEvent;
    if (e.key === `w`) {
      playerVelocity = -0.03;
    } else if (e.key === `s`) {
      playerVelocity = 0.03;
    }

    if (e.key === `a`) {
      playerAngle -= 0.1;
    } else if (e.key === `d`) {
      playerAngle += 0.1;
    }

    if (e.key === `m`) {
      isGameMapOpened = !isGameMapOpened;
    }
  })

  window.addEventListener(`keyup`, (event: KeyboardEvent) => {
    if ([`w`, `s`].includes(event.key)) {
      playerVelocity = 0;
    }
  })
}

function drawGrid() {
  for (let x = 0; x <= GRID_COLS; x++) {
    app.drawLine(new Vec2(x, 0), new Vec2(x, GRID_ROWS), 0.01, "#707070");
  }
  for (let y = 0; y <= GRID_ROWS; y++) {
    app.drawLine(new Vec2(0, y), new Vec2(GRID_COLS, y), 0.01, "#707070");
  }

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (GAME_MAP[x][y] === 1) {
        app.drawRect(new Vec2(x, y), "#000");
      }
    }
  }

  if (_DEBUG) {
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        app.drawText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, new Vec2(x, y + 0.2));
      }
    }
  }
}

function drawPlayer() {
  updatePlayerDirection();
  if (_DEBUG) {
    const halfOfFov = FOV / 2;
    const leftAngle = playerAngle - halfOfFov;
    const rightAngle = playerAngle + halfOfFov;

    // cos(a) = adj/hypot
    // cos(fov/2) = PLANE/hypot
    // hypot * cos(fov/2) = PLANE
    // hypot = PLANE/cos(fov/2)
    const sideLength = PLANE / Math.cos(halfOfFov);

    const leftPlaneSide = playerPos.add(new Vec2(Math.cos(leftAngle), Math.sin(leftAngle)).unit().scale(sideLength));
    const rightPlaneSide = playerPos.add(new Vec2(Math.cos(rightAngle), Math.sin(rightAngle)).unit().scale(sideLength));

    app.drawLine(playerPos, leftPlaneSide, 0.1, `pink`);
    app.drawLine(playerPos, rightPlaneSide, 0.1, `pink`);
    app.drawLine(leftPlaneSide, rightPlaneSide, 0.1, `pink`);
    app.drawLine(playerPos, playerPos.add(playerDirection.scale(PLANE)), 0.1, `pink`);
  }
  app.drawCircle(playerPos, 0.1, "yellow");
}

function drawRays() {
  const halfOfFov = FOV / 2;
  const da = FOV / RAY_COUNT;
  for (let i = 0; i < RAY_COUNT; i++) {
    const rayAngle = playerAngle - halfOfFov + (i * da);
    const rayDir = new Vec2(Math.cos(rayAngle) * 1e-9, Math.sin(rayAngle) * 1e-9);
    drawSingleRay(rayDir);
  }
}

function drawSingleRay(rayDirection: Vec2) {
  const rayEnd = playerPos.add(rayDirection);
  app.drawLine(playerPos, rayEnd);
  let p3;
  let side;
  const { point, nearestSide } = walkRay(playerPos, rayEnd);
    p3 = point;
    side = nearestSide;
  const d = rayEnd.sub(playerPos);
  while(true) {
    const x = d.x > 0 ? Math.trunc(p3.x) : (side === 'x' ? (Math.ceil(p3.x - 1)) : Math.trunc(p3.x));
    const y = d.y > 0 ? Math.trunc(p3.y) : (side === 'y' ? (Math.ceil(p3.y - 1)) : Math.trunc(p3.y));
    if (GAME_MAP[x][y] > 0) {
      break;
    }
    const { point, nearestSide } = walkRay(playerPos, p3);
    p3 = point;
    side = nearestSide;
  }

  app.drawLine(playerPos, p3, 0.01, `red`);
}

function walkRay(p1: Vec2, p2: Vec2): { point: Vec2, nearestSide: string } {
  // y1 = k*x1 + c
  // y2 = k*x2 + c
  // c = y1 - (k*x1)
  // y2 = k*x2 + y1 - k*x1
  // y2 - y1 = k*x2 - k*x1
  // y2 - y1 = k(x2 - x1)
  // k = (y2 - y1)/(x2 - x1)
  // y - c = k*x
  // x = (y-c)/k

  // k = dy / dx;
  // c = y1 - (k*x1)
  // x = (y-c)/k

  const d = p2.sub(p1);
  const k = d.y/d.x;
  const c = p1.y - (k * p1.x);

  const p3 = new Vec2();

  p2 = new Vec2(p2.x + (Math.sign(d.x)*1e-7), p2.y + (Math.sign(d.y)*1e-7));

  let nearestSide = 'y'

  if (d.x === 0) {
    p3.x = p2.x;
    p3.y = d.y > 0 ? Math.ceil(p2.y) : Math.floor(p2.y);
  } else {
    p3.y = d.y > 0 ? Math.ceil(p2.y) : Math.floor(p2.y);
    p3.x = (p3.y - c)/k;

    const p3t = new Vec2();
    p3t.x = d.x > 0 ? Math.ceil(p2.x) : Math.floor(p2.x);
    p3t.y = k * p3t.x + c;

    if (p2.distance(p3t) < p2.distance(p3)) {
      p3.set(...p3t.array);
      nearestSide = 'x'
    }
  }

  if (_DEBUG) {
    app.drawCircle(p3, 0.03, "red");
  }

  return { point: p3, nearestSide };
}