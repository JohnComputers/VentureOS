import { useRef, useEffect } from "react";

export default function NetworkField() {
  const ref = useRef(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let w, h, raf;
    const dpr = window.devicePixelRatio || 1;
    const N = 46;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: Math.random() * 1.6 + 0.6,
    }));
    const resize = () => {
      w = cvs.width = cvs.offsetWidth * dpr;
      h = cvs.height = cvs.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const dx = (p.x - q.x) * w, dy = (p.y - q.y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 150 * dpr) {
            ctx.strokeStyle = `rgba(110,150,255,${0.12 * (1 - d / (150 * dpr))})`;
            ctx.lineWidth = dpr;
            ctx.beginPath();
            ctx.moveTo(p.x * w, p.y * h);
            ctx.lineTo(q.x * w, q.y * h);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(120,160,255,0.5)";
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} />;
}
