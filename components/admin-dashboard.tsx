"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Package, Bell, Shield, BarChart, Moon, Sun } from "lucide-react"
import { ManageRepsView } from "@/components/admin/manage-reps-view"
import { ManageProductsView } from "@/components/admin/manage-products-view"
import { OrdersManagementView } from "@/components/admin/orders-management-view"
import { ManageAdminsView } from "@/components/admin/manage-admins-view"
import { SalesRepsStats } from "@/components/admin/sales-reps-stats"
import { useTheme } from "next-themes"

type AdminTab = "reps" | "products" | "orders" | "admins" | "stats"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>("orders")
  const { theme, setTheme } = useTheme()

  const hasFullPermission = user?.role === "admin" && (user?.admin_permission === "full" || !user?.admin_permission)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">مرحباً، {user?.full_name || user?.username}</h1>
              <p className="text-xs text-muted-foreground">لوحة تحكم المدير</p>
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
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Bell className="h-5 w-5" />
            <span className="hidden sm:inline">الطلبيات</span>
          </button>
          {hasFullPermission && (
            <>
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "stats"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <BarChart className="h-5 w-5" />
                <span className="hidden sm:inline">الإحصائيات</span>
              </button>
              <button
                onClick={() => setActiveTab("reps")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "reps"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">المندوبين</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "products"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="hidden sm:inline">الدرافت</span>
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === "admins"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="hidden sm:inline">المديرين</span>
              </button>
            </>
          )}
        </div>
      </div>

      <main className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
        {activeTab === "orders" && <OrdersManagementView />}
        {hasFullPermission && activeTab === "stats" && <SalesRepsStats />}
        {hasFullPermission && activeTab === "reps" && <ManageRepsView />}
        {hasFullPermission && activeTab === "products" && <ManageProductsView />}
        {hasFullPermission && activeTab === "admins" && <ManageAdminsView />}
      </main>
    </div>
  )
}
