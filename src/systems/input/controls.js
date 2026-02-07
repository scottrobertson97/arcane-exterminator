import { canvas } from '../../core/dom.js'
import { camera } from '../../core/camera.js'
import { input, state, zoomState } from '../../state/gameState.js'

export function setKeyState(key, isDown) {
  if (key === 'ArrowUp' || key === 'w') input.up = isDown
  if (key === 'ArrowDown' || key === 's') input.down = isDown
  if (key === 'ArrowLeft' || key === 'a') input.left = isDown
  if (key === 'ArrowRight' || key === 'd') input.right = isDown
}

export function updateMouseTarget(event) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const cam = camera()
  input.mouseX = cam.x + ((event.clientX - rect.left) * scaleX) / zoomState.zoom
  input.mouseY = cam.y + ((event.clientY - rect.top) * scaleY) / zoomState.zoom
}

export function bindInputHandlers() {
  window.addEventListener('keydown', event => {
    setKeyState(event.key, true)
  })

  window.addEventListener('keyup', event => {
    setKeyState(event.key, false)
  })

  canvas.addEventListener('mousedown', event => {
    if (!state.running) return
    input.mouseActive = true
    updateMouseTarget(event)
  })

  window.addEventListener('mouseup', () => {
    input.mouseActive = false
  })

  window.addEventListener('mousemove', event => {
    if (!input.mouseActive) return
    updateMouseTarget(event)
  })

  canvas.addEventListener('pointerdown', event => {
    if (!state.running) return
    input.mouseActive = true
    updateMouseTarget(event)
    canvas.setPointerCapture(event.pointerId)
  })

  canvas.addEventListener('pointermove', event => {
    if (!input.mouseActive) return
    updateMouseTarget(event)
  })

  canvas.addEventListener('pointerup', event => {
    input.mouseActive = false
    canvas.releasePointerCapture(event.pointerId)
  })

  canvas.addEventListener('pointercancel', event => {
    input.mouseActive = false
    canvas.releasePointerCapture(event.pointerId)
  })
}
