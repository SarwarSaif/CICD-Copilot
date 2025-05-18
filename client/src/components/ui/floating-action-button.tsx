import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 md:hidden">
      <Link href="/photos">
        <a className={cn(
          "h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
          className
        )}>
          <i className="ri-add-line text-2xl"></i>
        </a>
      </Link>
    </div>
  );
}
