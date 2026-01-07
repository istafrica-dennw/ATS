import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ReactComponent as ISTLogo } from "../../assets/logo/IST logo black.svg";

const navigation = [
  { name: "Start", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Locations", href: "/locations" },
  { name: "People", href: "/people" },
];

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const shouldBeTransparent = transparent && isHomePage && !scrolled;

  useEffect(() => {
    if (!transparent || !isHomePage) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent, isHomePage]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldBeTransparent
          ? "bg-transparent"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ISTLogo
                className={`h-10 w-auto transition-all duration-300 ${
                  shouldBeTransparent
                    ? "brightness-0 invert"
                    : "dark:invert dark:brightness-200"
                }`}
              />
              <span
                className={`hidden sm:block text-xl font-semibold transition-colors duration-300 ${
                  shouldBeTransparent
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                Careers
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  shouldBeTransparent
                    ? isActive(item.href)
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                    : isActive(item.href)
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/connect"
              className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                shouldBeTransparent
                  ? "text-white border-2 border-white/80 hover:bg-white/10"
                  : "text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
              }`}
            >
              Connect
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${
                shouldBeTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden py-4 border-t animate-slide-down ${
              shouldBeTransparent
                ? "border-white/20 bg-black/50 backdrop-blur-md rounded-b-lg"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    shouldBeTransparent
                      ? isActive(item.href)
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      : isActive(item.href)
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div
                className={`border-t mt-4 pt-4 space-y-2 ${
                  shouldBeTransparent
                    ? "border-white/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Link
                  to="/connect"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connect
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
