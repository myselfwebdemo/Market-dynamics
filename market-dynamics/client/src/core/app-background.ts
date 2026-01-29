import Star, { max_size, min_size } from "./star";
import { STAR_CONFIG } from "./starConfig";

const canvas = document.getElementById('APP_BACKGROUND') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
ctx.scale(1,1);

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

const stars = spawnStars(STAR_CONFIG.n_stars_per_row);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // auto resize
    // canvas.width = window.innerWidth * devicePixelRatio;
    // canvas.height = window.innerHeight * devicePixelRatio;
    // ctx.scale(1,1)

    for (const star of stars) {
        star.update();
        star.draw(ctx);
    }
    requestAnimationFrame(animate);
}

animate();
