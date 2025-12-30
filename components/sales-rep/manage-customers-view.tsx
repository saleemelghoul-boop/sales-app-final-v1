"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, type Customer } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Store, Phone, MapPin, FileText, Edit } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function ManageCustomersView() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    notes: "",
  })

  useEffect(() => {
    loadCustomers()
  }, [user?.id])

  const loadCustomers = () => {
    try {
      console.log("[v0] 👥 Loading customers for sales rep:", user?.id)
      const allCustomers = db.getCustomers()
      const myCustomers = allCustomers.filter((c) => c.sales_rep_id === user?.id)
      console.log("[v0] ✅ Loaded customers:", myCustomers.length)
      setCustomers(myCustomers)
    } catch (error) {
      console.error("[v0] ❌ Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const startEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      area: "",
      notes: "",
    })
    setIsDialogOpen(true)
  }

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCustomer) {
        db.updateCustomer(editingCustomer.id, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        })
        console.log("[v0] ✅ Updated customer:", editingCustomer.id)
        alert("تم تعديل العميل بنجاح!")
      } else {
        console.log("[v0] ➕ Adding customer:", formData.name)
        db.addCustomer({
          sales_rep_id: user?.id || "",
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        })
        alert("تم إضافة العميل بنجاح!")
      }

      setFormData({ name: "", phone: "", address: "", area: "", notes: "" })
      setEditingCustomer(null)
      setIsDialogOpen(false)
      loadCustomers()
    } catch (error) {
      console.error("[v0] ❌ Error saving customer:", error)
      alert("حدث خطأ أثناء حفظ العميل")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">إدارة العملاء</h2>
          <p className="text-sm text-muted-foreground">الصيدليات والعملاء</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingCustomer(null)
              setFormData({ name: "", phone: "", address: "", area: "", notes: "" })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "تعديل العميل" : "إضافة عميل جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">اسم العميل / الصيدلية</Label>
                <Input
                  id="customer_name"
                  placeholder="مثال: صيدلية الشفاء"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">رقم الهاتف</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  placeholder="07XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_area">المنطقة</Label>
                <Input
                  id="customer_area"
                  placeholder="مثال: الكرادة، المنصور..."
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_address">العنوان التفصيلي</Label>
                <Textarea
                  id="customer_address"
                  placeholder="العنوان الكامل"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_notes">ملاحظات</Label>
                <Textarea
                  id="customer_notes"
                  placeholder="ملاحظات إضافية"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCustomer ? "حفظ التعديلات" : "إضافة العميل"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">لا يوجد عملاء مضافين</p>
            <p className="text-center text-sm text-muted-foreground">قم بإضافة عملائك للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Store className="mt-1 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{customer.name}</h3>
                      {customer.phone && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      )}
                      {customer.area && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {customer.area}
                        </p>
                      )}
                      {customer.address && <p className="mt-1 text-sm text-muted-foreground">{customer.address}</p>}
                      {customer.notes && (
                        <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                          <FileText className="mt-0.5 h-3 w-3" />
                          {customer.notes}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => startEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
