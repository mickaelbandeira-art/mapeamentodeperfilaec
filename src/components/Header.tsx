import { useState } from "react";
import { Moon, Sun, Shield, Palette, Settings, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/hooks/useAccentColor";
import aecLogo from "@/assets/aec-logo.png";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { activeColor, changeColor, colors } = useAccentColor();
  const [showColors, setShowColors] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Close color palette when closing the main menu
  const toggleMenu = () => {
    if (showMenu) {
      setShowColors(false);
    }
    setShowMenu(!showMenu);
  };

  return (
    <header className="fixed bottom-0 right-0 z-50 flex flex-col items-end pointer-events-none">
      {/* Main Menu Options - Hidden by default, toggled via gear icon */}
      <div
        className={`pointer-events-auto flex flex-col gap-0 border-l-2 border-t-2 border-foreground bg-background p-0 brutal-card shadow-none transition-all duration-300 origin-bottom-right h-screen justify-center w-[80px] ${showMenu ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-12 absolute right-0 top-0 h-0 w-0 overflow-hidden"
          }`}
      >
        {/* Color Palette Popover */}
        {showColors && (
          <div
            className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-background border-2 border-foreground shadow-[6px_6px_0px_var(--foreground)] p-4 w-56 animate-in slide-in-from-right-4 duration-200"
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

        <div className="flex flex-col w-full">
          {/* Close Button at top of menu */}
          <button
            onClick={toggleMenu}
            className="p-4 hover:bg-destructive hover:text-destructive-foreground transition-all flex justify-center w-full"
            title="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="border-b-2 border-foreground w-full my-4"></div>

          {/* Home (Logo) */}
          <button
            onClick={() => { navigate("/"); setShowMenu(false); }}
            className="p-4 border-b-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-all flex justify-center items-center w-full"
            title="Início"
          >
            <img
              src={aecLogo}
              alt="AEC"
              className="w-10 h-auto dark:invert grayscale brightness-200"
            />
          </button>

          {/* Dashboard */}
          <button
            onClick={() => { navigate("/dashboard"); setShowMenu(false); }}
            className="p-4 border-b-2 border-foreground hover:bg-secondary hover:text-secondary-foreground transition-all flex justify-center w-full"
            title="Dashboard"
          >
            <Shield className="h-6 w-6" />
          </button>

          {/* Color Palette Toggle */}
          <button
            onClick={() => setShowColors((prev) => !prev)}
            className={`p-4 border-b-2 border-foreground transition-all relative flex justify-center w-full ${showColors
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
            className="p-4 hover:bg-accent hover:text-accent-foreground transition-all flex justify-center w-full"
            title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          >
            {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Main Gear/Settings Button - Visible only when menu is closed */}
      <button
        onClick={toggleMenu}
        className={`pointer-events-auto absolute bottom-8 right-0 pr-2 pl-4 py-4 border-l-2 border-t-2 border-b-2 border-r-0 border-foreground bg-background brutal-card transition-all duration-300 z-50 hover:bg-foreground hover:text-background flex justify-center items-center ${showMenu ? "opacity-0 scale-50 pointer-events-none translate-x-[100%]" : "opacity-100 scale-100 translate-x-0"
          }`}
        title="Menu"
        aria-label="Toggle Menu"
      >
        <Settings className="h-8 w-8" />
      </button>

    </header>
  );
};
