"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "left" | "right" | "none";
}

export function AnimatedSection({
    children,
    className,
    delay = 0,
    direction = "up",
}: AnimatedSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const getDirection = () => {
        switch (direction) {
            case "up":
                return { y: 40, x: 0 };
            case "left":
                return { x: -40, y: 0 };
            case "right":
                return { x: 40, y: 0 };
            case "none":
                return { x: 0, y: 0 };
            default:
                return { y: 40, x: 0 };
        }
    };

    const initial = { opacity: 0, ...getDirection() };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
            transition={{ duration: 0.8, ease: "easeOut", delay }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
