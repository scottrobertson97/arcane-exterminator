import { state } from '../state/gameState.js'

let updateFn = () => {}
let drawFn = () => {}
let updateHudFn = () => {}

export function configureLoop({ update, draw, updateHud }) {
  updateFn = update
  drawFn = draw
  updateHudFn = updateHud
}

export function loop(timestamp) {
  if (!state.running) {
    state.lastTime = timestamp
    drawFn()
    updateHudFn()
    requestAnimationFrame(loop)
    return
  }

  const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000)
  state.lastTime = timestamp

  updateFn(dt)
  drawFn()
  updateHudFn()

  requestAnimationFrame(loop)
}
