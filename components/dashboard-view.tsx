"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

export function DashboardView() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">نظرة عامة على الأداء</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
              <p className="text-lg font-bold text-foreground">$124.5K</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className="text-accent">+12.5%</span>
            <span className="text-muted-foreground">من الشهر الماضي</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">العملاء</p>
              <p className="text-lg font-bold text-foreground">1,248</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className="text-accent">+8.2%</span>
            <span className="text-muted-foreground">عملاء جدد</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الصفقات</p>
              <p className="text-lg font-bold text-foreground">342</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className="text-accent">+15.3%</span>
            <span className="text-muted-foreground">هذا الشهر</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">معدل التحويل</p>
              <p className="text-lg font-bold text-foreground">68%</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className="text-accent">+5.1%</span>
            <span className="text-muted-foreground">تحسن</span>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-semibold mb-4 text-foreground">أداء المبيعات الشهرية</h3>
        <div className="space-y-3">
          {[
            { month: "يناير", amount: "$18.2K", percentage: 85 },
            { month: "فبراير", amount: "$22.4K", percentage: 95 },
            { month: "مارس", amount: "$19.8K", percentage: 78 },
            { month: "أبريل", amount: "$24.1K", percentage: 100 },
            { month: "مايو", amount: "$21.5K", percentage: 88 },
          ].map((item) => (
            <div key={item.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.month}</span>
                <span className="font-semibold text-foreground">{item.amount}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-semibold mb-4 text-foreground">أفضل المندوبين</h3>
        <div className="space-y-3">
          {[
            { name: "أحمد محمد", sales: "$32.5K", deals: 45 },
            { name: "فاطمة علي", sales: "$28.3K", deals: 38 },
            { name: "محمود حسن", sales: "$24.7K", deals: 32 },
          ].map((rep, index) => (
            <div key={rep.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{rep.name}</p>
                  <p className="text-xs text-muted-foreground">{rep.deals} صفقة</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-accent">{rep.sales}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
