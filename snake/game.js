const GRID = 16
const SPEED = 7
const CELL = 28
const BOOST_EVERY = 5

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const scoreEl = document.getElementById('score')
const bestEl = document.getElementById('best')
const resetBtn = document.getElementById('resetBtn')

let best = Number(localStorage.getItem('snake.best') || 0)
bestEl.textContent = best

let snake, dir, nextDir, food, score, tickRate, foodsEaten, running
let last = 0, acc = 0

function reset(start=false) {
  snake = [{ x: Math.floor(GRID/2), y: Math.floor(GRID/2) }]
  dir = { x: 1, y: 0 }
  nextDir = { x: 1, y: 0 }
  food = spawnFood(snake)
  score = 0
  foodsEaten = 0
  tickRate = SPEED
  updateScore(0, true)
  running = start
  last = 0
  acc = 0
  drawBoard()
}

function updateScore(delta, doReset=false) {
  if (doReset) score = 0
  else score += delta
  scoreEl.textContent = score
  if (score > best) {
    best = score
    bestEl.textContent = best
    localStorage.setItem('snake.best', String(best))
  }
}

function spawnFood(body) {
  let p
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
  } while (body.some(s => s.x === p.x && s.y === p.y))
  return p
}

const keyDir = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y: 1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
}

function setDir(nd) {
  if (snake.length > 1 && nd.x === -dir.x && nd.y === -dir.y) return
  nextDir = nd
  if (!running) { running = true; last = 0 }
}

addEventListener('keydown', (e) => {
  const k = e.key
  const nd = keyDir[k]
  if (nd) { e.preventDefault(); setDir(nd) }
  if (k.toLowerCase() === 'r') { e.preventDefault(); reset(true) }
})

;(function enableSwipe(){
  let sx=0, sy=0, active=false
  const el = document.querySelector('.board')
  el.addEventListener('touchstart', (e)=>{ active=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY }, {passive:true})
  el.addEventListener('touchend', (e)=>{
    if(!active) return; active=false
    const dx = e.changedTouches[0].clientX - sx
    const dy = e.changedTouches[0].clientY - sy
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return
    if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx>0?1:-1, y: 0 })
    else setDir({ x: 0, y: dy>0?1:-1 })
  }, {passive:true})
})()

resetBtn.addEventListener('click', () => reset(true))

function resizeCanvas() {
  const cells = GRID * CELL
  canvas.width = cells
  canvas.height = cells
  drawBoard()
}
addEventListener('resize', resizeCanvas)

function drawCell(x, y, fill, stroke) {
  const s = CELL, px = x * s, py = y * s
  ctx.fillStyle = fill
  ctx.fillRect(px, py, s, s)
  if (stroke){ ctx.strokeStyle = stroke; ctx.strokeRect(px + .5, py + .5, s - 1, s - 1) }
}

function drawBoard() {
  ctx.fillStyle = '#0b1420'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255,255,255,.03)'
  ctx.lineWidth = 1
  for (let i = 0; i <= GRID; i++) {
    const p = i * CELL
    ctx.beginPath(); ctx.moveTo(p + .5, 0); ctx.lineTo(p + .5, canvas.height); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p + .5); ctx.lineTo(canvas.width, p + .5); ctx.stroke()
  }
  const cx = (food.x + .5) * CELL, cy = (food.y + .5) * CELL
  const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, CELL * 2.2)
  grd.addColorStop(0, 'rgba(83,229,168,.35)')
  grd.addColorStop(1, 'rgba(83,229,168,0)')
  ctx.fillStyle = grd
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 2.2, 0, Math.PI * 2); ctx.fill()
  drawCell(food.x, food.y, '#53e5a8', '#154a37')
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i]
    const head = i === 0
    drawCell(seg.x, seg.y, head ? '#6bc1ff' : '#b1d9ff', head ? '#204b6b' : '#395e84')
  }
}

function step(ts) {
  requestAnimationFrame(step)
  if (!last) last = ts
  const dt = (ts - last) / 1000
  last = ts
  if (running) {
    acc += dt
    const interval = 1 / tickRate
    while (acc >= interval) { tick(); acc -= interval }
  }
  drawBoard()
}

function tick() {
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) { reset(false); return }
  if (snake.some((s, i) => i && s.x === head.x && s.y === head.y)) { reset(false); return }
  snake.unshift(head)
  if (head.x === food.x && head.y === food.y) {
    updateScore(1)
    foodsEaten++
    if (foodsEaten % BOOST_EVERY === 0) tickRate += 0.7
    food = spawnFood(snake)
  } else {
    snake.pop()
  }
}

function boot(){
  resizeCanvas()
  reset(false)
  requestAnimationFrame(step)
}

boot()
