import { useState } from 'react';
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
        active
          ? "bg-primary-50 text-primary-600"
          : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <i className={cn(icon, "mr-3", active ? "text-primary-500" : "text-gray-500")}></i>
      {children}
    </a>
  );
}

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <i className="ri-code-box-line text-2xl text-primary-500 mr-2"></i>
          <h1 className="text-xl font-semibold text-gray-800">MopFlow</h1>
        </div>
        <button 
          className="text-gray-500 hover:text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={`ri-${menuOpen ? 'close' : 'menu'}-line text-2xl`}></i>
        </button>
      </div>
      
      {menuOpen && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <nav className="space-y-1 pt-4">
            <NavItem href="/" icon="ri-dashboard-line" active={location === "/"}>
              Dashboard
            </NavItem>
            <NavItem href="/mop-files" icon="ri-file-code-line" active={location === "/mop-files"}>
              MOP Files
            </NavItem>
            <NavItem href="/pipelines" icon="ri-flow-chart" active={location === "/pipelines"}>
              Pipelines
            </NavItem>
            <NavItem href="/shared" icon="ri-share-line" active={location === "/shared"}>
              Shared
            </NavItem>
            <NavItem href="/settings" icon="ri-settings-4-line" active={location === "/settings"}>
              Settings
            </NavItem>
          </nav>
        </div>
      )}
    </div>
  );
}
