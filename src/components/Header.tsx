import { useState } from "react";
import { Moon, Sun, Shield, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/hooks/useAccentColor";
import aecLogo from "@/assets/aec-logo.png";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { activeColor, changeColor, colors } = useAccentColor();
  const [showColors, setShowColors] = useState(false);

  return (
    <header className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">

      {/* Color Palette Popover */}
      {showColors && (
        <div
          className="absolute bottom-full right-0 mb-3 bg-background border-2 border-foreground shadow-[6px_6px_0px_var(--foreground)] p-4 w-56 animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header label */}
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b-2 border-foreground">
            Cores // AeC
          </p>

          {/* Color Swatches */}
          <div className="flex flex-col gap-2">
            {colors.map((color) => {
              const isActive = activeColor === color.hsl;
              return (
                <button
                  key={color.name}
                  onClick={() => changeColor(color.hsl)}
                  className={`flex items-center gap-3 w-full px-3 py-2 transition-all border-2 group
                    ${isActive
                      ? "border-foreground shadow-[3px_3px_0px_var(--foreground)]"
                      : "border-transparent hover:border-foreground"
                    }`}
                  title={color.name}
                  aria-label={`Selecionar cor ${color.name}`}
                >
                  {/* Color dot */}
                  <span
                    className="w-6 h-6 rounded-full shrink-0 border-2 border-foreground/30 transition-all group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  />
                  {/* Color name */}
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {color.name}
                  </span>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview strip */}
          <div className="mt-3 pt-3 border-t-2 border-foreground/20 flex gap-1">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => changeColor(c.hsl)}
                className="flex-1 h-2 transition-all hover:h-3"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Radical Floating Menu Bar */}
      <div className="flex flex-col gap-0 border-2 border-foreground bg-background p-1 brutal-card shadow-none">

        {/* Home (Logo) */}
        <button
          onClick={() => navigate("/")}
          className="p-3 border-b-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <img
            src={aecLogo}
            alt="AEC"
            className="h-8 w-auto dark:invert grayscale brightness-200"
          />
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="p-4 border-b-2 border-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
          title="Dashboard"
        >
          <Shield className="h-6 w-6" />
        </button>

        {/* Color Palette Toggle */}
        <button
          onClick={() => setShowColors((prev) => !prev)}
          className={`p-4 border-b-2 border-foreground transition-all relative ${showColors
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary hover:text-primary-foreground"
            }`}
          title="Cores AeC"
          aria-label={showColors ? "Fechar seletor de cores" : "Abrir seletor de cores"}
        >
          <Palette className="h-6 w-6" />
          {/* Active color dot indicator */}
          {!showColors && (
            <span
              className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-foreground"
              style={{ backgroundColor: `hsl(${activeColor})` }}
            />
          )}
        </button>

        {/* Dark / Light toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-4 hover:bg-accent hover:text-accent-foreground transition-all"
          title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
      </div>

      {/* Decorative Radical Label */}
      <div className="bg-foreground text-background font-black text-[10px] uppercase py-1 px-3 rotate-90 origin-right translate-x-full -translate-y-8 absolute right-0">
        AEC // PROFILE // v2.0
      </div>
    </header>
  );
};
