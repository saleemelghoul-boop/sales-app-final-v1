"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, type Order, type OrderItem } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Calendar, DollarSign, Edit, Send, Trash2, RotateCcw, RefreshCw } from "lucide-react"

export function MyOrdersView() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  useEffect(() => {
    loadOrders()
  }, [user?.id])

  const loadOrders = () => {
    try {
      const allOrders = db.getOrders()
      const myOrders = allOrders
        .filter((o) => o.sales_rep_id === user?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      console.log("[v0] 📦 Loaded orders:", myOrders.length)
      setOrders(myOrders)
    } catch (error) {
      console.error("[v0] ❌ Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const viewOrderDetails = (order: Order) => {
    try {
      const allItems = db.getOrderItems()
      const items = allItems.filter((item) => item.order_id === order.id)
      console.log("[v0] 📋 Loaded order items:", items.length)
      setOrderItems(items)
      setSelectedOrder(order)
    } catch (error) {
      console.error("[v0] ❌ Error loading order items:", error)
    }
  }

  const sendDraftOrder = (orderId: string) => {
    try {
      const updatedOrder = db.updateOrder(orderId, { status: "pending" })
      if (updatedOrder) {
        // Send notification to admin
        const users = db.getUsers()
        const admins = users.filter((u) => u.role === "admin")
        admins.forEach((admin) => {
          db.addNotification({
            user_id: admin.id,
            message: `طلبية جديدة من ${user?.full_name || user?.username} للعميل ${updatedOrder.customer_name}`,
            type: "order_submitted",
            is_read: false,
            related_order_id: updatedOrder.id,
          })
        })
        alert("تم إرسال الطلبية للمدير بنجاح!")
        loadOrders()
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error("[v0] ❌ Error sending draft:", error)
      alert("حدث خطأ أثناء إرسال الطلبية")
    }
  }

  const moveToTrash = (orderId: string) => {
    if (confirm("هل أنت متأكد من نقل هذه الطلبية إلى المهملات؟")) {
      db.moveOrderToTrash(orderId)
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

  const deletedOrders = orders.filter((o) => o.status === "deleted")

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
          <h2 className="text-xl font-semibold">طلبياتي</h2>
          <p className="text-sm text-muted-foreground">جميع الطلبيات والمسودات</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadOrders}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">الطلبيات النشطة</TabsTrigger>
          <TabsTrigger value="trash">سلة المهملات ({deletedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {orders.filter((o) => o.status !== "deleted").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">لا توجد طلبيات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders
                .filter((o) => o.status !== "deleted")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{order.customer_name}</h3>
                              {order.status === "draft" ? (
                                <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                                  مسودة
                                </Badge>
                              ) : order.status === "pending" ? (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                  قيد الانتظار
                                </Badge>
                              ) : order.status === "printed" ? (
                                <Badge variant="default" className="bg-green-100 text-green-700">
                                  جاهزة للاستلام
                                </Badge>
                              ) : (
                                <Badge variant="secondary">ملغية</Badge>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.created_at).toLocaleDateString("ar-SA")}
                              </span>
                              {order.total > 0 && (
                                <span className="flex items-center gap-1 numeric">
                                  <DollarSign className="h-3 w-3" />
                                  {order.total.toFixed(2)} د.ع
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => viewOrderDetails(order)} className="w-full">
                          {order.status === "draft" ? <Edit className="ml-2 h-4 w-4" /> : null}
                          {order.status === "draft" ? "عرض وتعديل المسودة" : "عرض التفاصيل"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
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
                          حذف
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

      {/* Order Details Dialog */}
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
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleString("ar-SA")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge
                    variant={
                      selectedOrder.status === "printed"
                        ? "default"
                        : selectedOrder.status === "draft"
                          ? "secondary"
                          : "secondary"
                    }
                  >
                    {selectedOrder.status === "draft"
                      ? "مسودة"
                      : selectedOrder.status === "printed"
                        ? "جاهزة للاستلام"
                        : "معلقة"}
                  </Badge>
                </div>
              </div>

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

              {selectedOrder.images && selectedOrder.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">الصور المرفقة:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img || "/placeholder.svg"}
                        alt={`صورة ${idx + 1}`}
                        className="h-32 w-full rounded-lg border object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.total > 0 && (
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>المجموع:</span>
                  <span className="numeric">{selectedOrder.total.toFixed(2)} د.ع</span>
                </div>
              )}

              <div className="flex gap-2">
                {selectedOrder.status === "draft" && (
                  <Button onClick={() => sendDraftOrder(selectedOrder.id)} className="flex-1">
                    <Send className="ml-2 h-4 w-4" />
                    إرسال الطلبية للمدير
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
    </div>
  )
}
