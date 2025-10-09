"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, GraduationCap, AlertCircle, Users, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/auth-service"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Trainings",
    href: "/trainings",
    icon: GraduationCap,
  },
  {
    name: "Missing Trainings",
    href: "/missing-trainings",
    icon: AlertCircle,
  },
  {
    name: "Attendees",
    href: "/attendees",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    AuthService.logout()
  }

  return (
    <aside className="flex flex-col h-screen w-64 border-r bg-sidebar text-sidebar-foreground">
      <div className="p-4 flex items-center gap-2 border-b">
        <Image 
          src="/assets/icps-logo.svg" 
          alt="ICPS Logo" 
          width={40} 
          height={40}
          className="dark:invert"
        />
        <span className="font-bold text-xl">ICPS</span>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  pathname === item.href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t space-y-3">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground/70">© ICPS 2024</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
