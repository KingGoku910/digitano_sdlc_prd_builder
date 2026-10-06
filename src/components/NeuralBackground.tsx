import React, { useEffect, useRef } from "react";

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse interactive coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 175,
      isActive: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Vibrant cybernetic color palette
    const colors = [
      { core: "#E0F2FE", glow: "#06B6D4", rgb: "6, 182, 212" },   // Cyan
      { core: "#F0F9FF", glow: "#38BDF8", rgb: "56, 189, 248" },  // Sky
      { core: "#EFF6FF", glow: "#3B82F6", rgb: "59, 130, 246" },  // Electric Blue
      { core: "#F5F3FF", glow: "#8B5CF6", rgb: "139, 92, 246" },  // Neon Violet
      { core: "#FAF5FF", glow: "#A855F7", rgb: "168, 85, 247" },  // Electric Purple
    ];

    // Node count scaled for lush interconnected graph
    const particleCount = Math.min(Math.floor((width * height) / 11000), 85);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      color: (typeof colors)[0];
      pulse: number;
      pulseSpeed: number;
      isHub: boolean;
    }

    interface SynapsePulse {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
      color: string;
    }

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isHub = Math.random() < 0.18; // 18% of nodes are major hubs
      const baseRadius = isHub ? Math.random() * 1.5 + 3.2 : Math.random() * 1.4 + 1.8;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isHub ? 0.35 : 0.65),
        vy: (Math.random() - 0.5) * (isHub ? 0.35 : 0.65),
        radius: baseRadius,
        baseRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.035 + 0.02,
        isHub,
      });
    }

    // Traveling action potential / synaptic pulses
    const pulses: SynapsePulse[] = [];

    const spawnPulse = () => {
      if (pulses.length > 12) return;
      const from = Math.floor(Math.random() * particles.length);
      // Find nearest neighbor
      let nearestIdx = -1;
      let nearestDist = 180;
      for (let j = 0; j < particles.length; j++) {
        if (from === j) continue;
        const dx = particles[from].x - particles[j].x;
        const dy = particles[from].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = j;
        }
      }
      if (nearestIdx !== -1) {
        pulses.push({
          fromIndex: from,
          toIndex: nearestIdx,
          progress: 0,
          speed: Math.random() * 0.018 + 0.012,
          color: particles[from].color.glow,
        });
      }
    };

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. Vivid Radial Cybernetic Atmosphere (Upper Header & Lower Accent)
      const gradCenter = ctx.createRadialGradient(
        width * 0.5,
        height * 0.25,
        50,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.65
      );
      gradCenter.addColorStop(0, "rgba(6, 182, 212, 0.12)");
      gradCenter.addColorStop(0.35, "rgba(59, 130, 246, 0.06)");
      gradCenter.addColorStop(0.7, "rgba(139, 92, 246, 0.03)");
      gradCenter.addColorStop(1, "rgba(11, 15, 23, 0)");
      ctx.fillStyle = gradCenter;
      ctx.fillRect(0, 0, width, height);

      // Periodically spawn synaptic pulses
      if (frameCount % 45 === 0) {
        spawnPulse();
      }

      const maxDistance = 165;

      // 2. Render Neural Axon Connection Lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const normalizedDist = 1 - dist / maxDistance;
            // Enhanced luminous alpha (brighter & attention grabbing)
            const alpha = Math.min(0.65, normalizedDist * 0.52);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Dynamic gradient between the two connected nodes
            const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            lineGrad.addColorStop(0, `rgba(${p1.color.rgb}, ${alpha})`);
            lineGrad.addColorStop(1, `rgba(${p2.color.rgb}, ${alpha})`);

            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = normalizedDist * 1.4 + 0.6;
            ctx.stroke();
          }
        }

        // Connect to user cursor when active
        if (mouse.isActive) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < mouse.radius) {
            const mAlpha = (1 - mDist / mouse.radius) * 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = "#38BDF8";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 3. Render Synaptic Pulses (Action Potentials)
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulses[pIdx];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const pFrom = particles[pulse.fromIndex];
        const pTo = particles[pulse.toIndex];
        if (!pFrom || !pTo) continue;

        const pulseX = pFrom.x + (pTo.x - pFrom.x) * pulse.progress;
        const pulseY = pFrom.y + (pTo.y - pFrom.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Render Neural Nodes (High-Brightness Luminous Particles)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Bounce from boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        const pulseFactor = Math.sin(p.pulse);
        const currentRadius = p.baseRadius + pulseFactor * 1.1;

        // Interactive cursor proximity boost
        let proximityBoost = 1;
        if (mouse.isActive) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < mouse.radius) {
            proximityBoost = 1 + (1 - mDist / mouse.radius) * 0.8;
          }
        }

        const finalRadius = Math.max(1.2, currentRadius * proximityBoost);

        // A. Outer Radiant Halo for Hubs
        if (p.isHub) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, finalRadius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.rgb}, 0.15)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, finalRadius * 1.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.rgb}, 0.3)`;
          ctx.fill();
        }

        // B. Main Luminous Body with Intense Neon Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.glow;
        ctx.shadowColor = p.color.glow;
        ctx.shadowBlur = p.isHub ? 22 : 14;
        ctx.fill();

        // C. Bright White-Hot Center Core (Attention Grabbing Spark)
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.7, finalRadius * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = p.color.core;
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-100"
    />
  );
}
