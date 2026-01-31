export const STAR_CONFIG = {
    color: 'rgb(255,100,100)',
    minSize: 10, // 5
    maxSize: 10, // 15
    nStarsPerRow: 42, // per row
}
export const STAR_MAGNIFIER = {
    radius: 500,
    concavityFactor: 2,
    sizeFactor: 2,
    initColor: (STAR_CONFIG.color.match(/\d+/g) ?? []).join(','),
    targetColor: '255,166,0', // #646cff = 100,108,255
    spiderWeb: false,
}
