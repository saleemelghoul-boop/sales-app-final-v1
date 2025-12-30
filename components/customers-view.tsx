"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MoreVertical } from "lucide-react"

const customers = [
  {
    id: 1,
    name: "شركة النور التجارية",
    contact: "خالد أحمد",
    phone: "+966 50 111 2222",
    email: "info@alnoor.com",
    status: "نشط",
    value: "$45.2K",
    lastContact: "منذ يومين",
  },
  {
    id: 2,
    name: "مؤسسة الأمل",
    contact: "سعيد محمد",
    phone: "+966 50 222 3333",
    email: "contact@alamal.com",
    status: "متابعة",
    value: "$32.8K",
    lastContact: "منذ أسبوع",
  },
  {
    id: 3,
    name: "شركة المستقبل",
    contact: "نورة علي",
    phone: "+966 50 333 4444",
    email: "info@almustaqbal.com",
    status: "نشط",
    value: "$28.5K",
    lastContact: "منذ 3 أيام",
  },
  {
    id: 4,
    name: "مجموعة التطوير",
    contact: "عبدالله حسن",
    phone: "+966 50 444 5555",
    email: "dev@tatweer.com",
    status: "جديد",
    value: "$15.3K",
    lastContact: "اليوم",
  },
]

export function CustomersView() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">العملاء</h1>
          <p className="text-sm text-muted-foreground">إدارة قاعدة العملاء</p>
        </div>
      </div>

      <div className="space-y-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="p-4 bg-card border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <Badge
                    variant={
                      customer.status === "نشط" ? "default" : customer.status === "جديد" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {customer.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{customer.contact}</p>
                <p className="text-xs text-muted-foreground">{customer.lastContact}</p>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-accent">{customer.value}</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <Phone className="w-3 h-3 mr-1" />
                اتصال
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                <Mail className="w-3 h-3 mr-1" />
                بريد
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
