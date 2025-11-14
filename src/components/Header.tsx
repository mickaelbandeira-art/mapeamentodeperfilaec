import { Moon, Sun, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import aecLogo from "@/assets/aec-logo.png";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo AEC - Pulsante */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center group"
          aria-label="Voltar para home"
        >
          <img
            src={aecLogo}
            alt="AEC Logo"
            className="h-10 w-auto animate-pulse-logo brightness-0 invert"
          />
        </button>

        {/* Botões da direita */}
        <div className="flex items-center gap-2">
          {/* Botão Dashboard */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10"
            aria-label="Acessar Dashboard"
            title="Dashboard"
          >
            <Shield className="h-5 w-5" />
          </Button>

          {/* Toggle Theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-primary/10"
            aria-label="Alternar tema"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
};
