"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { db, type User } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, UserPlus, Phone, CheckCircle2, XCircle, Edit2 } from "lucide-react"

export function ManageRepsView() {
  const [reps, setReps] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRep, setEditingRep] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    phone: "",
  })

  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    phone: "",
  })

  useEffect(() => {
    loadReps()
    const interval = setInterval(() => {
      loadReps()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadReps = async () => {
    try {
      const users = await db.getUsers()
      const salesReps = users.filter((u) => u.role === "sales_rep")
      setReps(salesReps)
    } catch (error) {
      console.error("[v0] ❌ Error loading reps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRep = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await db.addUser({
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        role: "sales_rep",
        is_active: true,
      })

      setFormData({ username: "", password: "", full_name: "", phone: "" })
      setIsAddDialogOpen(false)
      await loadReps()
      alert("تم إضافة المندوب بنجاح!")
    } catch (error) {
      console.error("[v0] ❌ Error adding rep:", error)
      alert("حدث خطأ أثناء إضافة المندوب")
    }
  }

  const handleEditRep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRep) return

    try {
      await db.updateUser(editingRep.id, {
        username: editFormData.username,
        password: editFormData.password,
        full_name: editFormData.full_name,
        phone: editFormData.phone,
      })

      setEditingRep(null)
      setIsEditDialogOpen(false)
      await loadReps()
      alert("تم تحديث بيانات المندوب بنجاح!")
    } catch (error) {
      console.error("[v0] ❌ Error updating rep:", error)
      alert("حدث خطأ أثناء تحديث البيانات")
    }
  }

  const openEditDialog = (rep: User) => {
    setEditingRep(rep)
    setEditFormData({
      username: rep.username,
      password: rep.password,
      full_name: rep.full_name,
      phone: rep.phone || "",
    })
    setIsEditDialogOpen(true)
  }

  const toggleRepStatus = async (repId: string, currentStatus: boolean) => {
    try {
      await db.updateUser(repId, { is_active: !currentStatus })
      await loadReps()
    } catch (error) {
      console.error("Error updating rep status:", error)
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
          <h2 className="text-xl font-semibold">إدارة المندوبين</h2>
          <p className="text-sm text-muted-foreground">إضافة وإدارة مندوبي المبيعات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مندوب
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مندوب جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  placeholder="أدخل الاسم الكامل"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">اسم الدخول</Label>
                <Input
                  id="username"
                  placeholder="أدخل اسم الدخول"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">الرقم السري</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="أدخل الرقم السري"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="أدخل رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full">
                إضافة المندوب
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات المندوب</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditRep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">الاسم الكامل</Label>
                <Input
                  id="edit_full_name"
                  placeholder="أدخل الاسم الكامل"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_username">اسم الدخول</Label>
                <Input
                  id="edit_username"
                  placeholder="أدخل اسم الدخول"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_password">الرقم السري</Label>
                <Input
                  id="edit_password"
                  type="text"
                  placeholder="أدخل الرقم السري"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">رقم الهاتف</Label>
                <Input
                  id="edit_phone"
                  type="tel"
                  placeholder="أدخل رقم الهاتف"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full">
                حفظ التعديلات
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">لا يوجد مندوبين مضافين</p>
            <p className="text-center text-sm text-muted-foreground">قم بإضافة مندوب جديد للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reps.map((rep) => (
            <Card key={rep.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rep.full_name || rep.username}</h3>
                      {rep.is_active ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          نشط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          <XCircle className="h-3 w-3" />
                          معطل
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">اسم الدخول: {rep.username}</p>
                    {rep.phone && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {rep.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(rep)}>
                      <Edit2 className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant={rep.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleRepStatus(rep.id, rep.is_active)}
                    >
                      {rep.is_active ? "تعطيل" : "تفعيل"}
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
