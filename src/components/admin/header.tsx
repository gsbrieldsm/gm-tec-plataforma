"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
