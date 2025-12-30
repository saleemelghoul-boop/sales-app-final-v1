"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginScreen } from "@/components/login-screen"
import { AdminDashboard } from "@/components/admin-dashboard"
import { SalesRepDashboard } from "@/components/sales-rep-dashboard"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-primary">جاري التحميل...</p>
          <p className="text-sm text-muted-foreground">يرجى الانتظار</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (user.role === "admin") {
    return <AdminDashboard />
  }

  return <SalesRepDashboard />
}
