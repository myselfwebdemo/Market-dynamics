import LOADER from './loader.module.css';
import { useRef, useEffect } from "react";
import Star from "../../core/star";

function Loader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(1,1);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const star = new Star(w/2, h/2, 20, '#646cff', 1.5, 30, 10);

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      star.update();
      star.draw(ctx);
      requestAnimationFrame(animate)
    }
    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={LOADER.main}
    />
  );
}

export default Loader;
