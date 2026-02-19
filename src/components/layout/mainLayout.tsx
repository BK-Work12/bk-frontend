"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useSidebar } from "@/context/SidebarContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, close } = useSidebar();

  /* JS-based lg breakpoint detection – bulletproof for Safari */
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="min-h-screen dark:bg-[#070707] bg-white relative">
      {/* Overlay for mobile – hidden once sidebar is permanently visible (xl+) */}
      {isOpen && !isDesktop && (
        <div
          data-sidebar-overlay=""
          onClick={close}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        data-main-content=""
        className="dark:bg-[#070707] pb-5 px-2 lg:px-4 min-h-screen"
        style={{ marginLeft: isDesktop ? 260 : 0 }}
      >
        <Header />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
