"use client"

import { LayoutDashboard, Users, UserCircle, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "dashboard" | "reps" | "customers" | "sales"
  onTabChange: (tab: "dashboard" | "reps" | "customers" | "sales") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "dashboard" as const, label: "الرئيسية", icon: LayoutDashboard },
    { id: "reps" as const, label: "المندوبون", icon: Users },
    { id: "customers" as const, label: "العملاء", icon: UserCircle },
    { id: "sales" as const, label: "المبيعات", icon: DollarSign },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
