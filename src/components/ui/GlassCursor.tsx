import { useState, useEffect, useCallback } from "react";
import { Glass } from "@samasante/liquid-glass";

/**
 * A glass magnifier cursor that replaces the default pointer with a
 * frosted liquid-glass lens. Follows the mouse across the entire page.
 *
 * Automatically disabled on touch / coarse-pointer devices.
 */
export function GlassCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  /* Detect coarse pointer (touch) — skip the custom cursor entirely */
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Track the mouse */
  const onMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
  }, []);

  const onLeave = useCallback(() => setVisible(false), []);
  const onEnter = useCallback(() => setVisible(true), []);

  useEffect(() => {
    if (isCoarse) return;

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    /* Hide the native cursor on the landing page */
    document.body.style.cursor = "none";
    /* Also hide on all interactive elements */
    const style = document.createElement("style");
    style.id = "glass-cursor-hide";
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.style.cursor = "";
      const s = document.getElementById("glass-cursor-hide");
      if (s) s.remove();
    };
  }, [isCoarse, onMove, onLeave, onEnter]);

  if (isCoarse) return null;

  const SIZE = 68;

  return (
    <div
      className="glass-cursor-wrapper"
      style={{
        position: "fixed",
        left: pos.x - SIZE / 2,
        top: pos.y - SIZE / 2,
        width: SIZE,
        height: SIZE,
        pointerEvents: "none",
        zIndex: 99999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
        willChange: "transform, left, top",
      }}
    >
      <Glass
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 0 0 1.5px rgba(255,255,255,0.35), 0 0 20px 2px rgba(56,189,248,0.12), inset 0 0 8px rgba(255,255,255,0.10)",
        }}
        optics={{
          mapSize: 256,
          clipToShape: true,
          softEdge: true,
          depth: 2.95,
          curvature: 0.52,
          dispersion: 0.65,
          strength: 0.22,
          bend: 0.75,
          bendWidth: 0.12,
          frost: 5.5,
          brightness: 0,
          specular: 1.95,
          sheenAngle: 50,
          sheen: 1.3,
          sheenWidth: 3.5,
          glow: 0.25,
        }}
      />
    </div>
  );
}
