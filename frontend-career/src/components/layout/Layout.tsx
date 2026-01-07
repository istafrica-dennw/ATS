import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header transparent={isHomePage} />
      {/* Add padding-top for fixed header on non-homepage */}
      <main className={`flex-1 ${!isHomePage ? "pt-16" : ""}`}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
