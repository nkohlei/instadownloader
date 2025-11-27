"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
}

export default function BackgroundAnimation() {
    const [starsNear, setStarsNear] = useState<Star[]>([]);
    const [starsMid, setStarsMid] = useState<Star[]>([]);
    const [starsFar, setStarsFar] = useState<Star[]>([]);

    // Mouse position tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring configs for different layers (different stiffness/damping = different speeds/lag)
    const springConfigNear = { damping: 30, stiffness: 200 }; // Fast, responsive
    const springConfigMid = { damping: 40, stiffness: 150 };  // Medium
    const springConfigFar = { damping: 50, stiffness: 100 };  // Slow, deep

    const xNear = useSpring(mouseX, springConfigNear);
    const yNear = useSpring(mouseY, springConfigNear);

    const xMid = useSpring(mouseX, springConfigMid);
    const yMid = useSpring(mouseY, springConfigMid);

    const xFar = useSpring(mouseX, springConfigFar);
    const yFar = useSpring(mouseY, springConfigFar);

    useEffect(() => {
        // Generate stars on client side to avoid hydration mismatch
        const generateStars = (count: number, minSize: number, maxSize: number) => {
            return Array.from({ length: count }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // %
                y: Math.random() * 100, // %
                size: Math.random() * (maxSize - minSize) + minSize,
                opacity: Math.random() * 0.5 + 0.3,
            }));
        };

        setStarsNear(generateStars(30, 2, 3));   // Fewer, larger, closer
        setStarsMid(generateStars(60, 1, 2));    // Medium count/size
        setStarsFar(generateStars(150, 0.5, 1)); // Many, tiny, distant

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            // Calculate offset from center
            const targetX = (clientX - window.innerWidth / 2) * -0.1; // Invert and scale for parallax
            const targetY = (clientY - window.innerHeight / 2) * -0.1;

            // Apply different multipliers for layers manually if needed, 
            // or rely on spring physics. Here we multiply the input to the spring.

            // High sensitivity:
            mouseX.set(targetX * 2);
            mouseY.set(targetY * 2);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#050505]">
            {/* Deep Space Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#000000] to-[#000000] opacity-80" />

            {/* Far Layer - Slowest */}
            <motion.div
                className="absolute inset-[-10%]" // Oversize to prevent edges showing
                style={{ x: xFar, y: yFar, scale: 1.1 }}
            >
                {starsFar.map((star) => (
                    <div
                        key={`far-${star.id}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                        }}
                    />
                ))}
            </motion.div>

            {/* Mid Layer - Medium Speed */}
            <motion.div
                className="absolute inset-[-10%]"
                style={{ x: xMid, y: yMid, scale: 1.1 }}
            >
                {starsMid.map((star) => (
                    <div
                        key={`mid-${star.id}`}
                        className="absolute rounded-full bg-blue-100"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`
                        }}
                    />
                ))}
            </motion.div>

            {/* Near Layer - Fastest */}
            <motion.div
                className="absolute inset-[-10%]"
                style={{ x: xNear, y: yNear, scale: 1.1 }}
            >
                {starsNear.map((star) => (
                    <div
                        key={`near-${star.id}`}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            boxShadow: `0 0 ${star.size * 4}px rgba(255, 255, 255, 0.8)`
                        }}
                    />
                ))}
            </motion.div>

            {/* Vignette for focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-50" />
        </div>
    );
}
