import React from 'react';

const Card = ({
    children,
    className = '',
    hover = false,
    glass = false,
    ...props
}) => {
    const baseStyles = "rounded-xl border border-gray-200 bg-white shadow-sm";
    const hoverStyles = hover ? "transition-all duration-200 hover:shadow-lg hover:-translate-y-1" : "";
    const glassStyles = glass ? "bg-white/80 backdrop-blur-sm" : "bg-white";

    return (
        <div
            className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
