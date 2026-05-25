import { useEffect, useRef } from 'react';
import { useUser } from '../store/UserContext';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useUser();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      const numStars = window.innerWidth < 768 ? 100 : 200;
      for (let i = 0; i < numStars; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          vx: Math.random() * 0.2 - 0.1,
          vy: Math.random() * 0.2 - 0.1,
          color: theme === 'dark' 
            ? Math.random() > 0.5 ? '#ffffff' : Math.random() > 0.5 ? '#4fc3f7' : '#b388ff' 
            : '#000000',
          opacity: Math.random(),
          flicker: Math.random() * 0.05
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += (Math.random() > 0.5 ? p.flicker : -p.flicker);
        
        if (p.opacity > 1) p.opacity = 1;
        if (p.opacity < 0.1) p.opacity = 0.1;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Convert opacity to hex
        const hexOpacity = Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = `${p.color}${hexOpacity}`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg-primary)] bg-ambient transition-colors duration-500">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
    </div>
  );
}
