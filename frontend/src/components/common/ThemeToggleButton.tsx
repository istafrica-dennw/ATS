import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
