"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, LogOut } from "lucide-react"

type NavbarProps = {
  onLogout: () => void
  className?: string
}

export function Navbar({ onLogout, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 w-full h-16 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        className
      )}
    >
      <div className="mx-auto flex items-center justify-between gap-4 px-4 h-full">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">Mini-kanban</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
