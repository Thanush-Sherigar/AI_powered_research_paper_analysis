export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
