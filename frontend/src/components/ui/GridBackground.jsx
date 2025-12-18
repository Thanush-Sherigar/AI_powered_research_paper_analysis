import React from "react";
import { cn } from "../../lib/utils";

export function GridBackground({ children, className, size = 80 }) {
    return (
        <div
            className={cn(
                "relative flex w-full h-full items-center justify-center bg-white",
                className
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 pointer-events-none",
                )}
                style={{
                    backgroundSize: `${size}px ${size}px`,
                    backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.5) 2px, transparent 2px), linear-gradient(to bottom, rgba(59, 130, 246, 0.5) 2px, transparent 2px)`
                }}
            />
            {/* Radial gradient for the container to give a faded look */}
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
            />

            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </div>
    );
}
