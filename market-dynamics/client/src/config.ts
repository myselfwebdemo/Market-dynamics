export const STAR_CONFIG = {
    nStarsPerRow: 42,
    color: 'rgba(122, 122, 122, 0.2)',
    size: 10,
}
export const STAR_MAGNIFIER = {
    radius: 500,
    concavityFactor: 2.3,
    sizeFactor: 3,
    lastingEffectFactor: 0.08,
    initColor: (STAR_CONFIG.color.match(/\d+/g) ?? []).join(','),
    targetColor: '163, 170, 255', // #a3aaff
    // targetColor: '100,108,255', // rgb(100 108 255)
    spiderWeb: false,
}
