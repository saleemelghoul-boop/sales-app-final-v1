"use client"

import { useState, useEffect } from "react"
import { db, type User, type AdminPermission } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Edit, Trash2, Shield, ShieldCheck, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function ManageAdminsView() {
  const { user: currentUser } = useAuth()
  const [admins, setAdmins] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditSelfDialogOpen, setIsEditSelfDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)
  const [editingSelf, setEditingSelf] = useState<User | null>(null)

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [deletePin, setDeletePin] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    full_name: "",
    phone: "",
    email: "", // إضافة البريد الإلكتروني
    security_question: "", // إضافة سؤال الأمان
    security_answer: "", // إضافة جواب سؤال الأمان
    admin_permission: "full" as AdminPermission,
  })

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    const users = await db.getUsers()
    const adminUsers = Array.isArray(users) ? users.filter((u) => u.role === "admin") : []
    setAdmins(adminUsers)
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.full_name) {
      alert("الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    if (!newAdmin.security_question || !newAdmin.security_answer) {
      alert("الرجاء إضافة سؤال أمان وجوابه لاستعادة كلمة المرور")
      return
    }

    const users = await db.getUsers()
    if (users.some((u) => u.username === newAdmin.username)) {
      alert("اسم المستخدم موجود بالفعل")
      return
    }

    await db.addUser({
      username: newAdmin.username,
      password: newAdmin.password,
      full_name: newAdmin.full_name,
      phone: newAdmin.phone,
      email: newAdmin.email,
      security_question: newAdmin.security_question,
      security_answer: newAdmin.security_answer,
      role: "admin",
      is_active: true,
      admin_permission: newAdmin.admin_permission,
    })

    setNewAdmin({
      username: "",
      password: "",
      full_name: "",
      phone: "",
      email: "",
      security_question: "",
      security_answer: "",
      admin_permission: "full",
    })
    setIsAddDialogOpen(false)
    loadAdmins()
  }

  const handleEditAdmin = async () => {
    if (!editingAdmin) return

    await db.updateUser(editingAdmin.id, {
      username: editingAdmin.username,
      password: editingAdmin.password,
      full_name: editingAdmin.full_name,
      phone: editingAdmin.phone,
      admin_permission: editingAdmin.admin_permission,
    })

    setEditingAdmin(null)
    setIsEditDialogOpen(false)
    loadAdmins()
  }

  const handleEditSelf = async () => {
    if (!editingSelf || !currentUser) return

    const updatedUser = await db.updateUser(currentUser.id, {
      username: editingSelf.username,
      password: editingSelf.password,
      full_name: editingSelf.full_name,
      phone: editingSelf.phone,
      email: editingSelf.email,
      security_question: editingSelf.security_question,
      security_answer: editingSelf.security_answer,
    })

    if (updatedUser) {
      localStorage.setItem("sales_current_user", JSON.stringify(updatedUser))
      window.location.reload()
    }

    setEditingSelf(null)
    setIsEditSelfDialogOpen(false)
  }

  const handleDeleteAdmin = async (id: string) => {
    if (id === currentUser?.id) {
      alert("لا يمكنك حذف حسابك الحالي")
      return
    }

    if (confirm("هل أنت متأكد من حذف هذا المدير؟")) {
      await db.deleteUser(id)
      loadAdmins()
    }
  }

  const handleDeleteAllData = () => {
    if (deletePin !== "0000") {
      setDeleteError("الرمز السري غير صحيح")
      return
    }

    if (!confirm("هل أنت متأكد تماماً؟ سيتم حذف جميع البيانات نهائياً ولا يمكن التراجع عن ذلك!")) {
      return
    }

    try {
      console.log("[v0] مسح جميع البيانات من localStorage...")

      const keys = [
        "sales_app_users",
        "sales_app_product_groups",
        "sales_app_products",
        "sales_app_customers",
        "sales_app_orders",
        "sales_app_order_items",
        "sales_app_notifications",
      ]

      keys.forEach((key) => {
        localStorage.removeItem(key)
        console.log(`[v0] تم مسح: ${key}`)
      })

      localStorage.clear()

      alert("تم مسح جميع البيانات بنجاح. سيتم إعادة تحميل الصفحة...")

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error("[v0] خطأ أثناء مسح البيانات:", err)
      setDeleteError("حدث خطأ أثناء مسح البيانات")
    }
  }

  const openEditDialog = (admin: User) => {
    setEditingAdmin({ ...admin })
    setIsEditDialogOpen(true)
  }

  const openEditSelfDialog = () => {
    if (currentUser) {
      setEditingSelf({ ...currentUser })
      setIsEditSelfDialogOpen(true)
    }
  }

  return (
    <div className="space-y-4">
      {currentUser && (
        <Card className="border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentUser.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                {currentUser.phone && <p className="text-xs text-muted-foreground">{currentUser.phone}</p>}
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  حسابك الحالي
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={openEditSelfDialog}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل بياناتي
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">إدارة المديرين</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              إضافة مدير جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مدير جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم المستخدم *</Label>
                <Input
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>سؤال الأمان *</Label>
                <Input
                  value={newAdmin.security_question}
                  onChange={(e) => setNewAdmin({ ...newAdmin, security_question: e.target.value })}
                  placeholder="مثال: ما اسم مدينتك؟"
                />
                <p className="text-xs text-muted-foreground">سيُستخدم هذا السؤال لاستعادة كلمة المرور</p>
              </div>
              <div className="space-y-2">
                <Label>جواب سؤال الأمان *</Label>
                <Input
                  value={newAdmin.security_answer}
                  onChange={(e) => setNewAdmin({ ...newAdmin, security_answer: e.target.value })}
                  placeholder="أدخل الجواب"
                />
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات *</Label>
                <Select
                  value={newAdmin.admin_permission}
                  onValueChange={(value: AdminPermission) => setNewAdmin({ ...newAdmin, admin_permission: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">صلاحيات كاملة</SelectItem>
                    <SelectItem value="orders_only">استلام الطلبيات فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddAdmin}>حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {currentUser?.admin_permission === "full" && (
        <Card className="border-2 border-red-200 bg-red-50/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">منطقة الخطر</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تحذير: العمليات التالية خطيرة ولا يمكن التراجع عنها. استخدمها بحذر شديد.
            </p>
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowDeleteAllDialog(true)
                setDeletePin("")
                setDeleteError("")
              }}
            >
              <AlertTriangle className="ml-2 h-4 w-4" />
              مسح جميع بيانات النظام
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {admin.admin_permission === "full" ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Shield className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{admin.full_name}</h3>
                  <p className="text-sm text-muted-foreground">@{admin.username}</p>
                  {admin.phone && <p className="text-xs text-muted-foreground">{admin.phone}</p>}
                  <div className="mt-1">
                    {admin.admin_permission === "full" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        صلاحيات كاملة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        استلام طلبيات فقط
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEditDialog(admin)}>
                  <Edit className="h-4 w-4" />
                </Button>
                {admin.id !== currentUser?.id && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editingSelf && (
        <Dialog open={isEditSelfDialogOpen} onOpenChange={setIsEditSelfDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بياناتي الشخصية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={editingSelf.full_name}
                  onChange={(e) => setEditingSelf({ ...editingSelf, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسم المستخدم *</Label>
                <Input
                  value={editingSelf.username}
                  onChange={(e) => setEditingSelf({ ...editingSelf, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={editingSelf.password}
                  onChange={(e) => setEditingSelf({ ...editingSelf, password: e.target.value })}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={editingSelf.phone || ""}
                  onChange={(e) => setEditingSelf({ ...editingSelf, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editingSelf.email || ""}
                  onChange={(e) => setEditingSelf({ ...editingSelf, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>سؤال الأمان</Label>
                <Input
                  value={editingSelf.security_question || ""}
                  onChange={(e) => setEditingSelf({ ...editingSelf, security_question: e.target.value })}
                  placeholder="مثال: ما اسم مدينتك؟"
                />
              </div>
              <div className="space-y-2">
                <Label>جواب سؤال الأمان</Label>
                <Input
                  value={editingSelf.security_answer || ""}
                  onChange={(e) => setEditingSelf({ ...editingSelf, security_answer: e.target.value })}
                  placeholder="أدخل الجواب"
                />
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                ملاحظة: سيتم تسجيل خروجك تلقائياً بعد حفظ التعديلات
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditSelfDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditSelf}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل بيانات المدير</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={editingAdmin.full_name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسم المستخدم *</Label>
                <Input
                  value={editingAdmin.username}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={editingAdmin.password}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={editingAdmin.phone || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editingAdmin.email || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>سؤال الأمان *</Label>
                <Input
                  value={editingAdmin.security_question || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, security_question: e.target.value })}
                  placeholder="مثال: ما اسم مدينتك؟"
                />
                <p className="text-xs text-muted-foreground">سيُستخدم هذا السؤال لاستعادة كلمة المرور</p>
              </div>
              <div className="space-y-2">
                <Label>جواب سؤال الأمان *</Label>
                <Input
                  value={editingAdmin.security_answer || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, security_answer: e.target.value })}
                  placeholder="أدخل الجواب"
                />
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات *</Label>
                <Select
                  value={editingAdmin.admin_permission}
                  onValueChange={(value: AdminPermission) =>
                    setEditingAdmin({ ...editingAdmin, admin_permission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">صلاحيات كاملة</SelectItem>
                    <SelectItem value="orders_only">استلام الطلبيات فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEditAdmin}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent className="text-right">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2 justify-end">
              <AlertTriangle className="h-5 w-5" />
              تحذير خطير: مسح جميع البيانات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800 font-medium">هذا الإجراء سيحذف جميع البيانات التالية بشكل نهائي:</p>
              <ul className="mt-2 text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>جميع المستخدمين (المديرين والمندوبين)</li>
                <li>جميع الطلبيات والإشعارات</li>
                <li>جميع العملاء والمنتجات</li>
                <li>جميع البيانات المحفوظة</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePin" className="text-base">
                الرجاء إدخال الرمز السري للتأكيد: <strong className="text-foreground">0000</strong>
              </Label>
              <Input
                id="deletePin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={deletePin}
                onChange={(e) => {
                  setDeletePin(e.target.value)
                  setDeleteError("")
                }}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            {deleteError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-600 text-center font-medium">{deleteError}</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteAllDialog(false)
                setDeletePin("")
                setDeleteError("")
              }}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllData} className="bg-red-600 hover:bg-red-700">
              تأكيد المسح النهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
