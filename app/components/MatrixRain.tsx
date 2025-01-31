"use client";

import type React from "react";
import { useRef, useEffect } from "react";

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Character set (Latin + Kana)
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    // Array to store the y-coordinate of each column
    const drops: number[] = [];

    // Initialize all columns
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    // Drawing function
    const draw = () => {
      // Black semi-transparent background to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set the color and font of the text
      ctx.fillStyle = "#0F0"; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      // Loop over each drop
      for (let i = 0; i < drops.length; i++) {
        // Choose a random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset the drop when it goes off-screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move the drop down
        drops[i]++;
      }

      // Call the drawing function again
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed left-0 top-0 -z-10 h-full w-full" />;
};

export default MatrixRain;
