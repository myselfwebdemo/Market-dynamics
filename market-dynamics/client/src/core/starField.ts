import Star, { max_size, min_size } from "./star";
import { STAR_MAGNIFIER, STAR_CONFIG } from "../config";

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

function spawnStars(nPerRow: number) {
    const stars = [];
    const gap_x = (screen.width - (nPerRow * max_size)) / (nPerRow + 1);
    const nRows = Math.round((screen.height - gap_x) / (gap_x/1.1 + max_size));

    for (let ny = 0; ny < nRows; ny++) {
        for (let nx = 0; nx < nPerRow; nx++) {
            const x = (gap_x * (nx + 1) + max_size * nx) + (max_size / 2);
            let y = (gap_x * (ny + 1) + max_size * ny) + (max_size / 2);
            
            const gap_end = screen.height - ((gap_x + max_size) * nRows);
            if (gap_x !== gap_end) {
                const avg = (gap_x + gap_end) /2;
                y -= (gap_x - avg);
            }

            const star_size = Math.random() * (max_size - min_size) + min_size;
            stars.push(new Star(x, y, star_size));
        }
    }
    return stars;
}

const stars = spawnStars(STAR_CONFIG.nStarsPerRow);

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
    const CF = STAR_MAGNIFIER.concavityFactor;
    let concavity_factor = 1;

    for (let f = 0; f < Math.abs(CF); f++) {
        if (CF < 0) {
            concavity_factor /= sum;
        } else {
            concavity_factor *= sum;
        }
    }

    const max_boundary_factor = 1 / concavity_factor;

    if (STAR_MAGNIFIER.spiderWeb) {
        const endX = cx * dpr + cos * dist;
        const endY = cy * dpr + sin * dist;
        
        if (dist < STAR_MAGNIFIER.radius * max_boundary_factor) {
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
    const influence = 1 - dist / STAR_MAGNIFIER.radius / (!!max_boundary_factor ? max_boundary_factor : 1)
    const scale = 1 + influence * STAR_MAGNIFIER.sizeFactor
    star.size = star.initSize * scale
}

function influenceColor(star: Star, dist: number, max_bondary_factor?: number) {
    const influence = Math.max(0, 1 - dist / STAR_MAGNIFIER.radius / (!!max_bondary_factor ? (max_bondary_factor/1.3) : 1));

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

        if (dist < STAR_MAGNIFIER.radius * max_boundary_factor) {
            influenceSize(star, dist, max_boundary_factor);
            influenceColor(star, dist, max_boundary_factor)
        } else {
            star.size += (star.initSize - star.size) * .1;
            star.color = 'rgb(255,100,100)'
        }
        star.draw(ctx);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCursorEffect();
    requestAnimationFrame(animate);
}

animate();
