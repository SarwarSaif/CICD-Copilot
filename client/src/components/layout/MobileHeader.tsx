import { useState } from 'react';
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
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
    </Link>
  );
}

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <i className="ri-gallery-line text-2xl text-primary-500 mr-2"></i>
          <h1 className="text-xl font-semibold text-gray-800">MemoryFlow</h1>
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
            <NavItem href="/photos" icon="ri-image-2-line" active={location === "/photos"}>
              My Photos
            </NavItem>
            <NavItem href="/collections" icon="ri-album-line" active={location === "/collections"}>
              Collections
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
