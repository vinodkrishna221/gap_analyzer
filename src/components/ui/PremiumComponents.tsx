"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- 1. Mesh Background ---
export const MeshBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-40 blur-[120px]"
                animate={{
                    background: [
                        "radial-gradient(circle, #ff6b35 0%, transparent 70%)",
                        "radial-gradient(circle, #a855f7 0%, transparent 70%)",
                        "radial-gradient(circle, #ff6b35 0%, transparent 70%)",
                    ],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px]"
                animate={{
                    background: [
                        "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                        "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
                        "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                    ],
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2,
                }}
            />
            {/* Overlay noise texture for texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

// --- 2. Magnetic Button ---
interface MagneticButtonProps extends React.ComponentProps<typeof Button> {
    children: React.ReactNode;
}

export const MagneticButton = ({ children, className, ...props }: MagneticButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { mass: 0.1, stiffness: 150, damping: 15 });
    const ySpring = useSpring(y, { mass: 0.1, stiffness: 150, damping: 15 });

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring }}
            className={cn(
                "relative overflow-hidden group rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm px-8 py-3 font-medium transition-colors hover:border-primary/50",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-primary-foreground transition-colors duration-300">
                {children}
            </span>
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-r from-primary via-orange-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ type: "tween", ease: "circIn", duration: 0.4 }}
            />
        </motion.button>
    );
};

// --- 3. Tilt Card ---
interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

export const TiltCard = ({ children, className }: TiltCardProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
    const style = { maskImage, WebkitMaskImage: maskImage };

    return (
        <div
            onMouseMove={onMouseMove}
            className={cn(
                "group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                <motion.div
                    className="absolute inset-0 z-10 opacity-50 bg-gradient-to-br from-primary/20 via-transparent to-transparent"
                    style={style}
                />
            </div>

            <div className="relative z-10 h-full">{children}</div>

            {/* Animated Border Gradient */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(var(--primary-rgb), 0.15),
              transparent 80%
            )
          `,
                }}
            />
        </div>
    );
};

// --- 4. Bento Grid ---
export const BentoGrid = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "grid max-w-7xl grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,1fr)]",
                className
            )}
        >
            {React.Children.map(children, (child, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: [0.25, 0.4, 0.55, 1.05], // Productive curve
                    }}
                    viewport={{ once: true }}
                    className={cn(
                        "h-full w-full",
                        // Example Logic: First item spans 2 cols, others 1. 
                        // We can customize this via className on the child if we want specific spans.
                        // But for generic auto-layout, we can keep it simple or use :nth-child in CSS.
                        i === 0 ? "md:col-span-2" : "md:col-span-1"
                    )}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    );
};
