"use client"

import { useEffect, useState } from "react"
import { db, type Order, type User as SalesRep, type OrderItem } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign,
  ImageIcon,
  Trash2,
  RotateCcw,
  X,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OrderWithRep = Order & {
  sales_rep?: SalesRep
}

export function OrdersManagementView() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithRep[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRep | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
    const interval = setInterval(() => {
      loadOrders()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      console.log("[v0] 🔄 تحميل الطلبيات...")
      const allOrders = await db.getOrders()
      console.log("[v0] 📦 إجمالي الطلبيات:", allOrders.length)

      const users = await db.getUsers()

      const ordersWithReps: OrderWithRep[] = allOrders
        .filter((o) => o.status !== "draft")
        .map((order) => ({
          ...order,
          sales_rep: users.find((u) => u.id === order.sales_rep_id),
        }))

      console.log("[v0] 📋 الطلبيات المعروضة:", ordersWithReps.length)
      console.log("[v0] 📊 تفاصيل الطلبيات:")
      ordersWithReps.forEach((o) => {
        console.log(`   - رقم ${o.id}: ${o.status} - ${o.customer_name} - صور: ${o.images?.length || 0}`)
      })

      setOrders(ordersWithReps)
      const pending = ordersWithReps.filter((o) => o.status === "pending")
      setPendingCount(pending.length)
      console.log("[v0] ⏳ طلبيات بانتظار الطباعة:", pending.length)
    } catch (error) {
      console.error("[v0] ❌ خطأ في تحميل الطلبيات:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPrinted = async (order: OrderWithRep) => {
    try {
      await db.updateOrderStatus(order.id, "printed")

      await db.addNotification({
        user_id: order.sales_rep_id,
        message: `طلبيتك للعميل ${order.customer_name} تمت طباعتها وجاهزة للاستلام ✅`,
        type: "order_printed",
        is_read: false,
      })

      await loadOrders()
      alert("تم وضع علامة تمت الطباعة بنجاح!")
    } catch (error) {
      console.error("[v0] ❌ خطأ في تحديث حالة الطلبية:", error)
      alert("حدث خطأ أثناء تأكيد الطباعة")
    }
  }

  const moveToTrash = (orderId: string) => {
    if (confirm("هل أنت متأكد من نقل هذه الطلبية إلى المهملات؟")) {
      db.deleteOrder(orderId)
      setSelectedOrder(null)
      loadOrders()
      alert("تم نقل الطلبية إلى المهملات")
    }
  }

  const permanentDelete = (orderId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الطلبية نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
      db.permanentDeleteOrder(orderId)
      setSelectedOrder(null)
      loadOrders()
      alert("تم حذف الطلبية نهائياً")
    }
  }

  const restoreFromTrash = (orderId: string) => {
    db.restoreOrder(orderId)
    setSelectedOrder(null)
    loadOrders()
    alert("تم استعادة الطلبية من المهملات")
  }

  const viewOrderDetails = (order: OrderWithRep) => {
    try {
      const allItems = db.getOrderItems()
      const items = allItems.filter((item) => item.order_id === order.id)
      setOrderItems(items)
      setSelectedOrder(order)
    } catch (error) {
      console.error("[v0] ❌ Error loading order items:", error)
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

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const printedOrders = orders.filter((o) => o.status === "printed")
  const deletedOrders = orders.filter((o) => o.status === "deleted")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">إدارة الطلبيات</h2>
          <p className="text-sm text-muted-foreground">طلبيات المندوبين</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadOrders}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Bell className="h-5 w-5 animate-pulse text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">طلبيات جديدة بانتظار الطباعة</h3>
                <p className="text-sm text-amber-700 numeric">لديك {pendingCount} طلبية جديدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">الطلبيات النشطة</TabsTrigger>
          <TabsTrigger value="trash">سلة المهملات ({deletedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="space-y-3">
            <h3 className="font-semibold numeric">الطلبيات المعلقة ({pendingCount})</h3>
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="mb-2 h-10 w-10 text-green-500" />
                  <p className="text-sm text-muted-foreground">لا توجد طلبيات معلقة</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <Card key={order.id} className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{order.customer_name}</h4>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              قيد الانتظار
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {order.sales_rep?.full_name || order.sales_rep?.username || "مندوب"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString("ar")}
                            </span>
                            {order.total > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="numeric">{order.total.toFixed(2)} د.ع</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => viewOrderDetails(order)} variant="outline" className="flex-1">
                          عرض التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPrinted(order)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                          تمت الطباعة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold numeric">الطلبيات المطبوعة ({printedOrders.length})</h3>
            {printedOrders.slice(0, 5).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{order.customer_name}</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          تمت الطباعة
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{new Date(order.created_at).toLocaleString("ar")}</span>
                        {order.total > 0 && <span className="numeric">{order.total.toFixed(2)} د.ع</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => viewOrderDetails(order)}>
                        التفاصيل
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => moveToTrash(order.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trash" className="space-y-4 mt-4">
          <div className="space-y-3">
            <h3 className="font-semibold numeric">سلة المهملات ({deletedOrders.length})</h3>
            {deletedOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Trash2 className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">سلة المهملات فارغة</p>
                </CardContent>
              </Card>
            ) : (
              deletedOrders.map((order) => (
                <Card key={order.id} className="border-red-200 bg-red-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{order.customer_name}</h4>
                          <Badge variant="destructive">محذوفة</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{new Date(order.created_at).toLocaleString("ar")}</span>
                          {order.total > 0 && <span className="numeric">{order.total.toFixed(2)} د.ع</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => viewOrderDetails(order)}>
                          التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 bg-transparent"
                          onClick={() => restoreFromTrash(order.id)}
                        >
                          <RotateCcw className="ml-1 h-4 w-4" />
                          استعادة
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => permanentDelete(order.id)}>
                          حذف نهائي
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلبية</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">اسم العميل:</span>
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المندوب:</span>
                  <span className="font-medium">
                    {selectedOrder.sales_rep?.full_name || selectedOrder.sales_rep?.username}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleString("ar")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge
                    variant={
                      selectedOrder.status === "printed"
                        ? "default"
                        : selectedOrder.status === "deleted"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedOrder.status === "printed"
                      ? "مطبوعة"
                      : selectedOrder.status === "deleted"
                        ? "محذوفة"
                        : "معلقة"}
                  </Badge>
                </div>
              </div>

              {selectedOrder.text_order && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4" />
                    نص الطلبية:
                  </h4>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-sm whitespace-pre-wrap" dir="rtl">
                      {selectedOrder.text_order}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.images && selectedOrder.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <ImageIcon className="h-4 w-4" />
                    الصور المرفقة:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.images.map((img, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setFullScreenImage(img)}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className="h-32 w-full rounded-lg border object-cover transition-transform hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium">اضغط للتكبير</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">الأصناف:</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between rounded-lg bg-muted p-2 text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground numeric">الكمية: {item.quantity}</p>
                      </div>
                      {item.price > 0 && (
                        <span className="font-medium numeric">{(item.price * item.quantity).toFixed(2)} د.ع</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.total > 0 && (
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>المجموع:</span>
                  <span className="numeric">{selectedOrder.total.toFixed(2)} د.ع</span>
                </div>
              )}

              <div className="flex gap-2">
                {selectedOrder.status === "pending" && (
                  <Button
                    onClick={() => handleMarkAsPrinted(selectedOrder)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تمت الطباعة
                  </Button>
                )}
                {selectedOrder.status === "printed" && (
                  <Button onClick={() => moveToTrash(selectedOrder.id)} variant="outline" className="flex-1">
                    <Trash2 className="ml-2 h-4 w-4" />
                    نقل إلى المهملات
                  </Button>
                )}
                {selectedOrder.status === "deleted" && (
                  <>
                    <Button
                      onClick={() => restoreFromTrash(selectedOrder.id)}
                      variant="outline"
                      className="flex-1 text-green-600"
                    >
                      <RotateCcw className="ml-2 h-4 w-4" />
                      استعادة
                    </Button>
                    <Button onClick={() => permanentDelete(selectedOrder.id)} variant="destructive" className="flex-1">
                      حذف نهائي
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!fullScreenImage} onOpenChange={() => setFullScreenImage(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black border-none">
          <div className="relative w-full h-screen flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-full w-12 h-12 shadow-lg"
                onClick={() => {
                  if (fullScreenImage) {
                    const link = document.createElement("a")
                    link.href = fullScreenImage
                    link.download = `طلبية-صورة-${Date.now()}.jpg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
              >
                <Download className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-red-600 text-white hover:bg-red-700 rounded-full w-12 h-12 shadow-lg"
                onClick={() => setFullScreenImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={fullScreenImage || "/placeholder.svg"}
                alt="صورة بالحجم الكامل"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxWidth: "95vw", maxHeight: "95vh" }}
              />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-base shadow-lg backdrop-blur">
              استخدم زر التحميل لحفظ الصورة أو X للإغلاق
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
