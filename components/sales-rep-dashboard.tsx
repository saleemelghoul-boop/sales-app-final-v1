"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Users, ShoppingCart, Package, Bell, Moon, Sun } from "lucide-react"
import { ManageCustomersView } from "@/components/sales-rep/manage-customers-view"
import { CreateOrderView } from "@/components/sales-rep/create-order-view"
import { MyOrdersView } from "@/components/sales-rep/my-orders-view"
import { NotificationsView } from "@/components/sales-rep/notifications-view"
import { useNotifications } from "@/hooks/use-notifications"
import { useTheme } from "next-themes"

type SalesRepTab = "orders" | "create-order" | "customers" | "notifications"

export function SalesRepDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<SalesRepTab>("create-order")
  const { unreadCount } = useNotifications(user?.id || "")
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">أهلاً {user?.full_name || user?.username}</h1>
              <p className="text-xs text-muted-foreground">لوحة المندوب</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل الوضع</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b bg-card/50">
        <div className="flex overflow-x-auto max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab("create-order")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "create-order"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="hidden sm:inline">طلبية جديدة</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">طلبياتي</span>
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "customers"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">العملاء</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "notifications"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="hidden sm:inline">الإشعارات</span>
            {unreadCount > 0 && (
              <span className="absolute left-1/2 top-2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
        {activeTab === "create-order" && <CreateOrderView />}
        {activeTab === "orders" && <MyOrdersView />}
        {activeTab === "customers" && <ManageCustomersView />}
        {activeTab === "notifications" && <NotificationsView />}
      </main>
    </div>
  )
}
