import { useState, useEffect } from "react";

// AeC Brand Colors
export const AEC_COLORS = [
    { name: "Cobalto", hex: "#1565C0", hsl: "213 78% 42%" },
    { name: "Céu", hex: "#00B8E0", hsl: "193 100% 44%" },
    { name: "Rubi", hex: "#E91E8C", hsl: "325 80% 52%" },
    { name: "Sol", hex: "#F5C400", hsl: "49 97% 48%" },
    { name: "Folha", hex: "#7DBF2A", hsl: "85 63% 45%" },
] as const;

export type AecColorName = typeof AEC_COLORS[number]["name"];

const STORAGE_KEY = "aec-accent-color";

// Applies the color to the document root CSS variables
function applyColor(hsl: string) {
    const root = document.documentElement;
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
}

export function useAccentColor() {
    const [activeColor, setActiveColor] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) ?? AEC_COLORS[0].hsl;
    });

    // Apply on mount and whenever activeColor changes
    useEffect(() => {
        applyColor(activeColor);
        localStorage.setItem(STORAGE_KEY, activeColor);
    }, [activeColor]);

    const changeColor = (hsl: string) => {
        setActiveColor(hsl);
    };

    return { activeColor, changeColor, colors: AEC_COLORS };
}
