import { STAR_CONFIG } from "../pages/App";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
ctx.scale(1,1);

const min_size = STAR_CONFIG.min_size;
const max_size = STAR_CONFIG.max_size;

class Star {
    x: number
    y: number
    size: number
    color: string
    pulseDir: number
    speed: number

constructor(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = STAR_CONFIG.color;

    this.pulseDir = 1;
    this.speed = Math.random() * 0.5;
}

draw(ctx: CanvasRenderingContext2D) {
    const p = Math.PI;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    const x_left = this.x - this.size;
    const x_right = this.x + this.size;
    const y_top = this.y - this.size;
    const y_bottom = this.y + this.size;
    const star_size = this.size - 1;
    
    ctx.beginPath();
    ctx.arc(x_left, y_top, star_size, 0, p/2)
    ctx.arc(x_left, y_bottom, star_size, p*3/2, p*2)
    ctx.arc(x_right, y_bottom, star_size, p, p*3/2)
    ctx.arc(x_right, y_top, star_size, p/2, p)

    ctx.stroke();
    ctx.fill();

    ctx.restore();
}

update() {
    this.size += this.speed * this.pulseDir;

    if (this.size >= max_size || this.size <= min_size) {
    this.pulseDir *= -1;
    }
}
}

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
