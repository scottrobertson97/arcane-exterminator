export const playerSprite = new Image()
playerSprite.src = 'sprites/wizard.png'

export const enemySmallSprite = new Image()
enemySmallSprite.src = 'sprites/rat_gray.png'

export const enemyBigSprite = new Image()
enemyBigSprite.src = 'sprites/rat_brown.png'

export const ashBatSprite = new Image()
ashBatSprite.src = 'sprites/ash_bat.png'

export const ironbackBeetleSprite = new Image()
ironbackBeetleSprite.src = 'sprites/ironback_beetle.png'

export const hexAcolyteSprite = new Image()
hexAcolyteSprite.src = 'sprites/hex_acolyte.png'

export const enemySpriteMap = Object.freeze({
  rat_small: enemySmallSprite,
  rat_big: enemyBigSprite,
  ash_bat: ashBatSprite,
  ironback_beetle: ironbackBeetleSprite,
  hex_acolyte: hexAcolyteSprite,
})

export const bladeSprite = new Image()
bladeSprite.src = 'sprites/knife.png'

export const relicSprite = new Image()
relicSprite.src = 'sprites/chest.png'

export const healthSprite = new Image()
healthSprite.src = 'sprites/health.png'

export const music = new Audio('Glinting Gold.wav')
music.loop = true
music.volume = 0.5
