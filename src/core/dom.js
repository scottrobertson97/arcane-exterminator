export const canvas = document.getElementById('game')
export const ctx = canvas.getContext('2d')

export const hud = {
  wave: document.getElementById('wave'),
  time: document.getElementById('time'),
  hp: document.getElementById('hp'),
  level: document.getElementById('level'),
  xp: document.getElementById('xp'),
  metaBonus: document.getElementById('meta-bonus'),
}

export const levelup = document.getElementById('levelup')
export const choicesEl = document.getElementById('choices')

export const menuOverlay = document.getElementById('menu-overlay')
export const menuPanels = {
  title: document.getElementById('menu-title-panel'),
  meta: document.getElementById('menu-meta-panel'),
  controls: document.getElementById('menu-controls-panel'),
}
export const menuButtons = {
  play: document.getElementById('menu-play'),
  meta: document.getElementById('menu-meta'),
  controls: document.getElementById('menu-controls'),
}
export const metaPanel = {
  shards: document.getElementById('meta-shards'),
  list: document.getElementById('meta-list'),
  back: document.getElementById('meta-back'),
  reset: document.getElementById('meta-reset'),
}
export const controlsBack = document.getElementById('controls-back')

export const runSummary = {
  overlay: document.getElementById('run-summary'),
  wave: document.getElementById('summary-wave'),
  time: document.getElementById('summary-time'),
  shards: document.getElementById('summary-shards'),
  total: document.getElementById('summary-total'),
  play: document.getElementById('summary-play'),
  meta: document.getElementById('summary-meta'),
}

export const zoomControls = {
  out: document.getElementById('zoom-out'),
  in: document.getElementById('zoom-in'),
  label: document.getElementById('zoom-label'),
}
