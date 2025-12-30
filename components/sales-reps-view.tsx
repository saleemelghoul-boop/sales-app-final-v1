"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, TrendingUp } from "lucide-react"

const salesReps = [
  {
    id: 1,
    name: "أحمد محمد",
    phone: "+966 50 123 4567",
    email: "ahmed@example.com",
    location: "الرياض",
    sales: "$32.5K",
    deals: 45,
    performance: 95,
  },
  {
    id: 2,
    name: "فاطمة علي",
    phone: "+966 50 234 5678",
    email: "fatima@example.com",
    location: "جدة",
    sales: "$28.3K",
    deals: 38,
    performance: 88,
  },
  {
    id: 3,
    name: "محمود حسن",
    phone: "+966 50 345 6789",
    email: "mahmoud@example.com",
    location: "الدمام",
    sales: "$24.7K",
    deals: 32,
    performance: 82,
  },
  {
    id: 4,
    name: "سارة خالد",
    phone: "+966 50 456 7890",
    email: "sarah@example.com",
    location: "الرياض",
    sales: "$21.2K",
    deals: 28,
    performance: 75,
  },
]

export function SalesRepsView() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مندوبو المبيعات</h1>
          <p className="text-sm text-muted-foreground">إدارة فريق المبيعات</p>
        </div>
      </div>

      <div className="space-y-3">
        {salesReps.map((rep) => (
          <Card key={rep.id} className="p-4 bg-card border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">{rep.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{rep.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{rep.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-accent">{rep.sales}</p>
                <p className="text-xs text-muted-foreground">{rep.deals} صفقة</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <Phone className="w-3 h-3 mr-1" />
                اتصال
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <Mail className="w-3 h-3 mr-1" />
                بريد
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">الأداء</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <span className="font-semibold text-foreground">{rep.performance}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${rep.performance}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
