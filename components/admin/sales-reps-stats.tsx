"use client"

import { useMemo } from "react"
import { db } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, TrendingUp, Award } from "lucide-react"

export function SalesRepsStats() {
  const stats = useMemo(() => {
    const users = db.getUsers()
    const orders = db.getOrders()
    const reps = users.filter((u) => u.role === "sales_rep")

    // حساب إحصائيات كل مندوب
    const repStats = reps.map((rep) => {
      const repOrders = orders.filter((o) => o.sales_rep_id === rep.id && o.status !== "deleted")
      const pendingOrders = repOrders.filter((o) => o.status === "pending").length
      const completedOrders = repOrders.filter((o) => o.status === "printed").length
      const totalOrders = repOrders.length
      const totalSales = repOrders.reduce((sum, order) => sum + order.total, 0)

      return {
        id: rep.id,
        name: rep.full_name,
        username: rep.username,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales,
      }
    })

    // ترتيب المندوبين حسب عدد الطلبيات
    repStats.sort((a, b) => b.totalOrders - a.totalOrders)

    // حساب الإحصائيات الكلية
    const totalOrders = repStats.reduce((sum, rep) => sum + rep.totalOrders, 0)
    const totalSales = repStats.reduce((sum, rep) => sum + rep.totalSales, 0)
    const activeReps = reps.filter((r) => r.is_active).length

    return {
      repStats,
      totalOrders,
      totalSales,
      activeReps,
      totalReps: reps.length,
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* الإحصائيات الكلية */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المندوبين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReps}</div>
            <p className="text-xs text-muted-foreground">نشط: {stats.activeReps}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبيات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">من جميع المندوبين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toLocaleString()} د.ع</div>
            <p className="text-xs text-muted-foreground">القيمة الإجمالية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل مندوب</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{stats.repStats[0]?.name || "-"}</div>
            <p className="text-xs text-muted-foreground">{stats.repStats[0]?.totalOrders || 0} طلبية</p>
          </CardContent>
        </Card>
      </div>

      {/* جدول إحصائيات المندوبين */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المندوبين التفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-semibold">#</th>
                  <th className="text-right p-2 font-semibold">اسم المندوب</th>
                  <th className="text-right p-2 font-semibold">إجمالي الطلبيات</th>
                  <th className="text-right p-2 font-semibold">قيد الانتظار</th>
                  <th className="text-right p-2 font-semibold">مكتملة</th>
                  <th className="text-right p-2 font-semibold">إجمالي المبيعات</th>
                </tr>
              </thead>
              <tbody>
                {stats.repStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-muted-foreground">
                      لا يوجد مندوبين بعد
                    </td>
                  </tr>
                ) : (
                  stats.repStats.map((rep, index) => (
                    <tr key={rep.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-xs text-muted-foreground">@{rep.username}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{rep.totalOrders}</span>
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          {rep.pendingOrders}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          {rep.completedOrders}
                        </span>
                      </td>
                      <td className="p-2 font-semibold">{rep.totalSales.toLocaleString()} د.ع</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
