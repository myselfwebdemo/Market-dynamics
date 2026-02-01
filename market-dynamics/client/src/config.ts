export const STAR_CONFIG = {
    nStarsPerRow: 42,
    color: 'rgb(255,100,100)',
    size: 10,
}
export const STAR_MAGNIFIER = {
    radius: 500,
    concavityFactor: 2.3,
    sizeFactor: 3,
    lastingEffectFactor: 0.08,
    initColor: (STAR_CONFIG.color.match(/\d+/g) ?? []).join(','),
    targetColor: '255,215,0',
    spiderWeb: false,
}
