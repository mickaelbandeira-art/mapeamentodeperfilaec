import { useState } from "react";
import { Moon, Sun, Shield, Palette, Settings, X, User as UserIcon, Monitor, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAccentColor } from "@/hooks/useAccentColor";
import { useAuth } from "@/hooks/useAuth";
import aecLogo from "@/assets/aec-logo.png";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { activeColor, changeColor, colors } = useAccentColor();
  const [showColors, setShowColors] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    if (showMenu) {
      setShowColors(false);
    }
    setShowMenu(!showMenu);
  };

  return (
    <header className="fixed bottom-0 right-0 z-50 flex flex-col items-end pointer-events-none group/header">
      {/* 
          RADICAL SIDEBAR: TECH_BRUTAL_CONTROL
          Betraying the 'Standard Drawer' with a fixed vertical command strip.
      */}
      <div
        className={`pointer-events-auto flex flex-col border-l-4 border-t-4 border-foreground bg-background p-0 transition-all duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] h-screen w-[100px] md:w-[120px] relative overflow-visible ${showMenu ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"
          }`}
      >
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        {/* Color Palette Module (Floating Asymmetric) */}
        {showColors && (
          <div
            className="absolute right-[calc(100%+20px)] bottom-24 bg-background border-4 border-foreground shadow-[12px_12px_0px_var(--primary)] p-6 w-64 animate-in fade-in slide-in-from-right-8 duration-300"
          >
            <div className="flex items-center justify-between mb-4 border-b-4 border-foreground pb-2">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] italic">
                Color_Core
              </p>
              <Activity className="w-4 h-4 text-primary animate-pulse" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {colors.map((color) => {
                const isActive = activeColor === color.hsl;
                return (
                  <button
                    key={color.name}
                    onClick={() => changeColor(color.hsl)}
                    className={`flex items-center gap-4 w-full px-4 py-3 transition-all border-4 group/color
                      ${isActive
                        ? "border-foreground bg-foreground text-background translate-x-1"
                        : "border-transparent hover:border-foreground/20"
                      }`}
                  >
                    <span
                      className="w-5 h-5 shrink-0 border-2 border-foreground"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      {color.name}
                    </span>
                    {isActive && <div className="ml-auto w-1 h-4 bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="flex flex-col h-full relative z-10">
          {/* TOP SECTION: IDENTITY */}
          <div className="p-4 border-b-4 border-foreground bg-foreground text-background flex flex-col items-center gap-2">
            <button
              onClick={toggleMenu}
              className="w-full aspect-square border-2 border-background flex items-center justify-center hover:bg-background hover:text-foreground transition-all group/close"
            >
              <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
            </button>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-10 h-10 bg-background flex items-center justify-center mb-1 border border-background-foreground/20">
                <UserIcon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-[8px] font-black uppercase text-center leading-none tracking-widest opacity-40">
                {profile?.full_name?.split(' ')[0] || "Guest"}
              </span>
            </div>
          </div>

          {/* MIDDLE SECTION: COMMANDS - Custom Scrollbar */}
          <div className="flex-1 flex flex-col divide-y-4 divide-foreground overflow-y-auto 
            scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-foreground/40 transition-colors">

            {/* Logo Button - Unified Pattern */}
            <button
              onClick={() => { navigate("/"); setShowMenu(false); }}
              className="p-6 hover:bg-primary transition-all flex flex-col items-center gap-2 group/nav border-b-4 border-foreground bg-white/5"
            >
              <img
                src={aecLogo}
                alt="AeC"
                className={`w-16 h-auto group-hover:scale-110 transition-transform ${theme === 'dark' ? 'filter brightness-0 invert' : 'filter brightness-0'}`}
              />
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 group-hover:text-background transition-all">Sistema</span>
            </button>

            {/* Dashboard Link */}
            <button
              onClick={() => { navigate("/dashboard"); setShowMenu(false); }}
              className="p-8 hover:bg-secondary text-foreground hover:text-white transition-all flex flex-col items-center gap-2 group/nav"
            >
              <Shield className="h-8 w-8 group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter">System</span>
            </button>

            {/* Appearance Module */}
            <button
              onClick={() => setShowColors((prev) => !prev)}
              className={`p-8 transition-all relative flex flex-col items-center gap-2 group/nav ${showColors ? "bg-primary text-background" : "hover:bg-primary"
                }`}
            >
              <Palette className="h-8 w-8" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Visual</span>
              {!showColors && (
                <div
                  className="absolute bottom-4 right-4 w-3 h-3 border-2 border-foreground"
                  style={{ backgroundColor: `hsl(${activeColor})` }}
                />
              )}
            </button>

            {/* Environment Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-8 hover:bg-accent text-foreground transition-all flex flex-col items-center gap-2"
            >
              {theme === "dark" ? <Sun className="h-8 w-8" /> : <Moon className="h-8 w-8" />}
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {theme === "dark" ? "Light_Mode" : "Dark_Mode"}
              </span>
            </button>
          </div>

          {/* BOTTOM SECTION: STATUS - Simplified */}
          <div className="p-4 border-t-4 border-foreground bg-foreground/5 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-foreground opacity-20" />
              ))}
            </div>
            <div className="text-[7px] font-black font-mono tracking-widest opacity-30 mt-1">
              V.2.0.4A
            </div>
          </div>
        </div>
      </div>

      {/* 
          RADICAL TRIGGER: THE_CORE_GATE
      */}
      <button
        onClick={toggleMenu}
        className={`pointer-events-auto fixed bottom-12 right-0 pl-6 pr-4 py-8 border-l-8 border-t-4 border-b-4 border-foreground bg-background transition-all duration-300 z-50 hover:bg-primary hover:translate-x-[-10px] group/trigger ${showMenu ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 shadow-[-15px_15px_0px_var(--secondary)]"
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          <Settings className="h-8 w-8 group-hover/trigger:rotate-90 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono [writing-mode:vertical-lr] rotate-180">
            SYSTEM_OP
          </span>
        </div>
        {/* Animated deco dot */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-secondary animate-ping" />
      </button>

    </header>
  );
};
