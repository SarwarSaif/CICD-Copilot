import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 md:hidden">
      <Link href="/mop-files">
        <div className={cn(
          "h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
          className
        )}>
          <Plus className="h-6 w-6" />
        </div>
      </Link>
    </div>
  );
}
