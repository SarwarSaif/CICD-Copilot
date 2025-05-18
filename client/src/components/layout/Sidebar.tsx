import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { generateInitials } from "@/lib/utils";

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

export default function Sidebar() {
  const [location] = useLocation();
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const firstName = userData?.firstName || "User";
  const lastName = userData?.lastName || "";
  const email = userData?.email || "user@example.com";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = generateInitials(fullName);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center">
          <i className="ri-gallery-line text-2xl text-primary-500 mr-2"></i>
          <h1 className="text-xl font-semibold text-gray-800">MemoryFlow</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">Photo organization for remote workers</p>
      </div>
      
      <nav className="flex-1 p-5 space-y-1">
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
      
      <div className="p-5 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {initials}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{fullName}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <i className="ri-logout-box-line mr-2"></i> Sign out
        </button>
      </div>
    </aside>
  );
}
