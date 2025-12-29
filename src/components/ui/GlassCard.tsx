"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "hover" | "neo";
}

export function GlassCard({
    children,
    className,
    variant = "default",
    ...props
}: GlassCardProps) {
    const baseStyles =
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300";

    const variants = {
        default: "",
        hover: "hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 hover:border-white/20",
        neo: "bg-gradient-to-br from-white/10 to-transparent border-t border-l border-white/20 shadow-[8px_8px_16px_0_rgba(0,0,0,0.2)]",
    };

    if (variant === "hover") {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(baseStyles, variants.hover, className)}
                {...props} // Apply props to the motion.div
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
                {children}
            </motion.div>
        );
    }

    return (
        <div className={cn(baseStyles, variants[variant], className)} {...props}>
            {children}
        </div>
    );
}
