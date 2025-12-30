"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

const sales = [
  {
    id: 1,
    customer: "شركة النور التجارية",
    rep: "أحمد محمد",
    amount: "$12.5K",
    date: "2024-01-15",
    status: "مكتمل",
    products: "منتجات تقنية",
  },
  {
    id: 2,
    customer: "مؤسسة الأمل",
    rep: "فاطمة علي",
    amount: "$8.3K",
    date: "2024-01-14",
    status: "قيد المعالجة",
    products: "خدمات استشارية",
  },
  {
    id: 3,
    customer: "شركة المستقبل",
    rep: "محمود حسن",
    amount: "$15.7K",
    date: "2024-01-13",
    status: "مكتمل",
    products: "حلول برمجية",
  },
  {
    id: 4,
    customer: "مجموعة التطوير",
    rep: "سارة خالد",
    amount: "$6.2K",
    date: "2024-01-12",
    status: "معلق",
    products: "أجهزة مكتبية",
  },
  {
    id: 5,
    customer: "شركة الابتكار",
    rep: "أحمد محمد",
    amount: "$9.8K",
    date: "2024-01-11",
    status: "مكتمل",
    products: "تدريب وتطوير",
  },
]

export function SalesView() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المبيعات</h1>
          <p className="text-sm text-muted-foreground">سجل المعاملات</p>
        </div>
      </div>

      <div className="space-y-3">
        {sales.map((sale) => (
          <Card key={sale.id} className="p-4 bg-card border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{sale.customer}</h3>
                  <Badge
                    variant={
                      sale.status === "مكتمل" ? "default" : sale.status === "قيد المعالجة" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {sale.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sale.products}</p>
              </div>
              <p className="text-lg font-bold text-accent">{sale.amount}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{sale.rep}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{sale.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
