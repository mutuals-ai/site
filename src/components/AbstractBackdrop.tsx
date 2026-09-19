"use client";

import { useEffect, useRef } from "react";
import s from "./abstract-backdrop.module.css";

type Point = { x: number; y: number; z: number; light: number };

// Two folds of one continuous surface, sampled as a monochrome halftone.
function surface(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 380; i++) {
    const u = (i / 380) * Math.PI * 2;
    const cx = Math.cos(u) * 470;
    const cy = Math.sin(u * 2) * 94;
    const cz = Math.sin(u) * 125;
    const twist = u * 1.5;
    for (let j = 0; j < 58; j++) {
      const v = (j / 58) * Math.PI * 2;
      const width = 62 + 18 * Math.sin(u * 3);
      const a = Math.cos(v) * width;
      const b = Math.sin(v) * 46;
      points.push({
        x: cx + Math.cos(u) * a * 0.42,
        y: cy + a * Math.cos(twist) - b * Math.sin(twist),
        z: cz + a * Math.sin(twist) + b * Math.cos(twist),
        light: 0.3 + 0.7 * Math.pow((Math.cos(v - 0.8) + 1) / 2, 1.5),
      });
    }
  }
  return points;
}

export function AbstractBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const points = surface();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      time = 0,
      visible = true;
    let pointerX = -1000,
      pointerY = -1000,
      hover = 0,
      targetHover = 0;
    let columns = 0,
      rows = 0;
    let field = new Float32Array(0);
    const spacing = 4;
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!reduced.matches && now - last < 33) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const delta = Math.min((now - last) / 1000, 0.06);
      last = now;
      if (!reduced.matches) time += delta;
      hover +=
        (targetHover - hover) *
        (reduced.matches ? 1 : 1 - Math.exp(-delta * 6));
      field.fill(0);
      const angleX = -0.3 + Math.sin(time * 0.32) * 0.28;
      const angleY = 0.12 + Math.sin(time * 0.24) * 0.32;
      const sx = Math.sin(angleX),
        cx = Math.cos(angleX),
        sy = Math.sin(angleY),
        cy = Math.cos(angleY);
      const scale = width < 600 ? width / 850 : width / 1100;
      const verticalScale = height / 410;
      const angleZ = Math.sin(time * 0.19) * 0.12;
      const spinSin = Math.sin(angleZ),
        spinCos = Math.cos(angleZ);
      for (const p of points) {
        const flow = Math.sin(p.x * 0.009 + time * 0.7) * 24;
        const x = p.x * cy + p.z * sy;
        const z = p.z * cy - p.x * sy;
        const y = (p.y + flow) * cx - z * sx;
        const depth = (p.y + flow) * sx + z * cx;
        const perspective = 950 / (950 - depth);
        const px =
          width / 2 + (x * spinCos - y * spinSin) * scale * perspective;
        const py =
          height * 0.51 +
          (y * spinCos + x * spinSin) * verticalScale * perspective;
        const gx = Math.round(px / spacing),
          gy = Math.round(py / spacing);
        if (gx < 0 || gx >= columns || gy < 0 || gy >= rows) continue;
        const front = 0.5 + (depth + 200) / 800;
        const sweep = 0.85 + 0.15 * Math.sin(p.x * 0.006 - time * 0.9);
        const light = p.light * front * sweep;
        const index = gy * columns + gx;
        field[index] = Math.max(field[index], light);
      }
      ctx.clearRect(0, 0, width, height);
      // Fixed square pixels make the surface feel machined, rather than glittery.
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < columns; x++) {
          const light = field[y * columns + x];
          if (light < 0.1) continue;
          const px = x * spacing,
            py = y * spacing;
          const distance = Math.hypot(px - pointerX, py - pointerY);
          const reveal = hover * Math.max(0, 1 - distance / 160) * 0.18;
          const edge = Math.min(
            1,
            px / Math.min(100, width * 0.12),
            (width - px) / Math.min(100, width * 0.12),
            py / 45,
            (height - py) / 45,
          );
          // Preserve a reading window without cutting a hard hole in the artwork.
          const readingDistance =
            Math.pow(
              (px - width * 0.5) / (width < 600 ? width * 0.55 : width * 0.32),
              4,
            ) + Math.pow((py - height * 0.36) / (height * 0.29), 4);
          const readingMask = 0.1 + 0.9 * (1 - Math.exp(-readingDistance));
          const alpha =
            (0.08 + light * 0.52 + reveal) * Math.max(0, edge) * readingMask;
          ctx.fillStyle = `rgba(185,191,198,${alpha})`;
          ctx.fillRect(px, py, 1.8, 1.8);
        }
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    };
    function schedule() {
      if (!frame && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.ceil(width / spacing);
      rows = Math.ceil(height / spacing);
      field = new Float32Array(columns * rows);
      schedule();
    };
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      targetHover = 1;
      schedule();
    };
    const leave = () => {
      targetHover = 0;
      schedule();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    });
    intersection.observe(element);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointercancel", leave);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", schedule);
    return () => {
      observer.disconnect();
      intersection.disconnect();
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointercancel", leave);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <div className={s.world} aria-hidden="true">
      <canvas ref={canvas} className={s.graph} />
    </div>
  );
}
