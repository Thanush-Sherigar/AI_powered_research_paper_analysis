import React from "react";
import { cn } from "../../lib/utils";

export function GridBackground({ children, className }) {
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
                    "[background-size:40px_40px]",
                    "[background-image:linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)]"
                )}
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
