import Star from "./star";
import { STAR_MAGNIFIER, STAR_CONFIG } from "../config";

interface Boundaries {
    mnx?: number
    mxx?: number
    mny: number
    mxy: number
    innerAreaBlocked: boolean
}

let BOUNDARIES: Record<string, Boundaries> = {
    window: {
        mny: 0,
        mxy: window.innerHeight,
        innerAreaBlocked: false
    }
};

let cursorPos = {x: 0, y: 0}
function getCursorCoords(event: MouseEvent) {
    cursorPos = { x: event.clientX, y: event.clientY };
}

const canvas = document.getElementById('APP_BACKGROUND') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const dpr = devicePixelRatio;

document.addEventListener('mousemove', getCursorCoords);
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;

export const starMagnifier = {
    radius: Number(localStorage.getItem('starMagnifierRadius')) || STAR_MAGNIFIER.radius,
    strength: Number(localStorage.getItem('starMagnifierStrength')) || STAR_MAGNIFIER.concavityFactor,
    maxSize: Number(localStorage.getItem('starMagnifierMaxSize')) || STAR_MAGNIFIER.sizeFactor,
}

export function updateStarMagnifier(partial: Partial<typeof starMagnifier>) {
  Object.assign(starMagnifier, partial);
}

function spawnStars(nPerRow: number) {
    const stars = [];
    const star_size = STAR_CONFIG.size;
    const gap_x = (screen.width - (nPerRow * star_size)) / (nPerRow + 1);
    const nRows = Math.round((screen.height - gap_x) / (gap_x/1.1 + star_size));
    let starIndex = 0;

    for (let ny = 0; ny < nRows; ny++) {
        for (let nx = 0; nx < nPerRow; nx++) {
            const x = (gap_x * (nx + 1) + star_size * nx) + (star_size / 2);
            let y = (gap_x * (ny + 1) + star_size * ny) + (star_size / 2);
            
            const gap_end = screen.height - ((gap_x + star_size) * nRows);
            if (gap_x !== gap_end) {
                const avg = (gap_x + gap_end) /2;
                y -= (gap_x - avg);
            }

            const star = new Star(x, y, star_size);
            star.boundingBoxSize = gap_x + star.size;
            star.index = starIndex;
            stars.push(star);
            starIndex++;
        }
    }
    return stars;
}

export const stars = spawnStars(STAR_CONFIG.nStarsPerRow);

export function createObjectBoundaries(htmlEl: HTMLElement, boundaryName: string, blockInnerArea: boolean) {
    const rect = htmlEl.getBoundingClientRect();

    BOUNDARIES[boundaryName] = {
        mnx: rect.left,
        mxx: rect.right,
        mny: rect.top,
        mxy: rect.bottom,
        innerAreaBlocked: blockInnerArea
    }
}

function withinBlockedArea(star: Star): boolean {
    return Object.values(BOUNDARIES).some(boundary => {
        if (star.y < 0 || star.y > BOUNDARIES.window.mxy) return true;
        // if (!boundary.innerAreaBlocked) return false;

        return (
            star.x > boundary.mnx! &&
            star.x < boundary.mxx! &&
            star.y > boundary.mny &&
            star.y < boundary.mxy
        );
    });
}

function getNonEuclDist(star: Star) {
    const cx = cursorPos.x;
    const cy = cursorPos.y;
    
    const dx = star.x - cx;
    const dy = star.y - cy;
    let dist = Math.sqrt(dx*dx + dy*dy) * dpr;

    const ang = Math.atan2(dy,dx);
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);

    const sum = Math.abs(sin) + Math.abs(cos);
    const CF = starMagnifier.strength;
    let concavity_factor = 1;

    concavity_factor *= Math.pow(sum, CF);

    const max_boundary_factor = 1 / concavity_factor;

    if (STAR_MAGNIFIER.spiderWeb) {
        const endX = cx * dpr + cos * dist;
        const endY = cy * dpr + sin * dist;
        
        if (dist < starMagnifier.radius * max_boundary_factor) {
            ctx.beginPath();
            ctx.moveTo(cx * dpr, cy * dpr);
            ctx.lineTo(endX, endY);
        }
        ctx.strokeStyle = STAR_CONFIG.color
        ctx.stroke();
    }

    return {dist, max_boundary_factor};
}

function influenceSize(star: Star, dist: number, max_boundary_factor?: number) {
    if (withinBlockedArea(star)) {
        star.size = star.initSize;
        return;
    }

    const influence = 1 - dist / starMagnifier.radius / (!!max_boundary_factor ? max_boundary_factor : 1)
    const scale = 1 + influence * starMagnifier.maxSize
    star.size = star.initSize * scale;
}

function influenceColor(star: Star, dist: number, max_bondary_factor?: number) {
    if (withinBlockedArea(star)) {
        star.color = STAR_CONFIG.color
        return;
    }

    const influence = Math.max(0, 1 - dist / starMagnifier.radius / (!!max_bondary_factor ? (max_bondary_factor/1.3) : 1));

    const initR = Number(STAR_MAGNIFIER.initColor.split(',')[0]);
    const initG = Number(STAR_MAGNIFIER.initColor.split(',')[1]);
    const initB = Number(STAR_MAGNIFIER.initColor.split(',')[2]);

    const targetR = Number(STAR_MAGNIFIER.targetColor.split(',')[0]);
    const targetG = Number(STAR_MAGNIFIER.targetColor.split(',')[1]);
    const targetB = Number(STAR_MAGNIFIER.targetColor.split(',')[2]);

    const r = Math.round(initR + (targetR - initR) * influence);
    const g = Math.round(initG + (targetG - initG) * influence);
    const b = Math.round(initB + (targetB - initB) * influence);

    star.color = `rgb(${r}, ${g}, ${b})`;
}

function updateCursorEffect() {
    for (const star of stars) {
        const {dist, max_boundary_factor} = getNonEuclDist(star);

        if (dist < starMagnifier.radius * max_boundary_factor) {
            influenceSize(star, dist, max_boundary_factor);
            influenceColor(star, dist, max_boundary_factor)
        } else {
            star.size += (star.initSize - star.size) * STAR_MAGNIFIER.lastingEffectFactor;
            star.color = STAR_CONFIG.color
        }
        star.draw(ctx);
    }
}

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCursorEffect();
    requestAnimationFrame(run);
}

run();

