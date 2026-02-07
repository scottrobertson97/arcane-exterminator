export const canvas = document.getElementById('game')
export const ctx = canvas.getContext('2d')

export const hud = {
  wave: document.getElementById('wave'),
  time: document.getElementById('time'),
  hp: document.getElementById('hp'),
  level: document.getElementById('level'),
  xp: document.getElementById('xp'),
}

export const instructions = document.getElementById('instructions')
export const startBtn = document.getElementById('start')
export const levelup = document.getElementById('levelup')
export const choicesEl = document.getElementById('choices')
export const zoomControls = {
  out: document.getElementById('zoom-out'),
  in: document.getElementById('zoom-in'),
  label: document.getElementById('zoom-label'),
}
