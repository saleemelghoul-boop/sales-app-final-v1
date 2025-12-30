"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, type Customer, type Product, type ProductGroup } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Trash2, Send, RefreshCw, Camera, Upload, Save } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export function CreateOrderView() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [groups, setGroups] = useState<ProductGroup[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantityInput, setQuantityInput] = useState("1")
  const [textOrder, setTextOrder] = useState("")

  useEffect(() => {
    loadData()
  }, [user?.id])

  const loadData = () => {
    setLoading(true)
    try {
      const allCustomers = db.getCustomers()
      const myCustomers = allCustomers.filter((c) => c.sales_rep_id === user?.id)

      const loadedGroups = db.getProductGroups()
      const loadedProducts = db.getProducts()

      setCustomers(myCustomers)
      setGroups(loadedGroups)
      setProducts(loadedProducts)
    } catch (error) {
      console.error("[v0] ❌ Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setQuantityInput("1")
  }

  const confirmAddProduct = () => {
    if (!selectedProduct) return

    const qty = Number.parseInt(quantityInput, 10)
    if (isNaN(qty) || qty < 1) {
      alert("الرجاء إدخال كمية صحيحة")
      return
    }

    const existingItem = orderItems.find((item) => item.product_id === selectedProduct.id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.product_id === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + qty,
                total_price: item.unit_price * (item.quantity + qty),
              }
            : item,
        ),
      )
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: qty,
          unit_price: selectedProduct.price,
          total_price: selectedProduct.price * qty,
        },
      ])
    }

    setSelectedProduct(null)
    setQuantityInput("1")
  }

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue) || numValue < 1) {
      return
    }

    setOrderItems(
      orderItems.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity: numValue,
            total_price: item.unit_price * numValue,
          }
        }
        return item
      }),
    )
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.product_id !== productId))
  }

  const handleCameraCapture = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.setAttribute("capture", "environment") // استخدام setAttribute بدلاً من property
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        console.log("[v0] 📸 Captured image from camera:", file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          console.log("[v0] ✅ Image converted to base64, size:", result.length)
          setAttachedImages([...attachedImages, result])
        }
        reader.onerror = (error) => {
          console.error("[v0] ❌ Error reading image:", error)
          alert("فشل تحميل الصورة")
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = (e: any) => {
      const files = Array.from(e.target?.files || []) as File[]
      console.log("[v0] 📁 Selected images from gallery:", files.length)
      files.forEach((file, index) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          console.log(`[v0] ✅ Image ${index + 1} converted to base64, size:`, result.length)
          setAttachedImages((prev) => [...prev, result])
        }
        reader.onerror = (error) => {
          console.error("[v0] ❌ Error reading image:", error)
          alert("فشل تحميل الصورة")
        }
        reader.readAsDataURL(file)
      })
    }
    input.click()
  }

  const removeImage = (index: number) => {
    setAttachedImages(attachedImages.filter((_, i) => i !== index))
  }

  const handleSaveDraft = () => {
    if (!selectedCustomerId && attachedImages.length === 0 && !textOrder.trim()) {
      alert("الرجاء اختيار العميل أو إضافة أصناف أو صور أو كتابة نص الطلبية")
      return
    }

    try {
      const customer = customers.find((c) => c.id === selectedCustomerId)
      const total = orderItems.reduce((sum, item) => sum + item.total_price, 0)

      console.log("[v0] 💾 Saving draft with images:", attachedImages.length)

      const newOrder = db.addOrder({
        sales_rep_id: user!.id,
        customer_id: selectedCustomerId,
        customer_name: customer?.name || "",
        status: "draft",
        total,
        text_order: textOrder.trim() || undefined,
        images: attachedImages,
      })

      orderItems.forEach((item) => {
        db.addOrderItem({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })
      })

      setSelectedCustomerId("")
      setOrderItems([])
      setAttachedImages([])
      setTextOrder("")

      alert("تم حفظ الطلبية كمسودة ✅")
    } catch (error) {
      console.error("[v0] ❌ Error saving draft:", error)
      alert("حدث خطأ أثناء حفظ المسودة")
    }
  }

  const handleSendToManager = () => {
    if (orderItems.length === 0 && attachedImages.length === 0 && !textOrder.trim()) {
      alert("⚠️ الرجاء إضافة أصناف أو صور أو كتابة نص الطلبية")
      return
    }

    if (orderItems.length > 0 && !selectedCustomerId) {
      alert("⚠️ الرجاء اختيار العميل عند إضافة أصناف")
      return
    }

    setSubmitting(true)
    try {
      const customer = customers.find((c) => c.id === selectedCustomerId)
      const total = orderItems.reduce((sum, item) => sum + item.total_price, 0)

      console.log("[v0] 📤 === بدء إرسال الطلبية ===")
      console.log("[v0] 📦 عدد الأصناف:", orderItems.length)
      console.log("[v0] 📷 عدد الصور:", attachedImages.length)
      console.log("[v0] 📝 نص الطلبية:", textOrder.trim() ? "موجود" : "غير موجود")
      console.log("[v0] 💰 المجموع:", total)
      console.log("[v0] 👤 العميل:", customer?.name || "طلبية")

      const newOrder = db.addOrder({
        sales_rep_id: user!.id,
        customer_id: selectedCustomerId || "none",
        customer_name: customer?.name || "طلبية",
        status: "pending",
        total,
        text_order: textOrder.trim() || undefined,
        images: attachedImages,
      })

      console.log("[v0] ✅ تم إنشاء الطلبية رقم:", newOrder.id)
      console.log("[v0] ✅ حالة الطلبية:", newOrder.status)
      console.log("[v0] ✅ عدد الصور المحفوظة:", newOrder.images?.length || 0)
      console.log("[v0] ✅ نص الطلبية محفوظ:", newOrder.text_order ? "نعم" : "لا")

      if (attachedImages.length > 0 && (!newOrder.images || newOrder.images.length === 0)) {
        console.error("[v0] ❌ خطأ: الصور لم تُحفظ في الطلبية!")
      }

      if (orderItems.length > 0) {
        orderItems.forEach((item) => {
          db.addOrderItem({
            order_id: newOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
          })
        })
        console.log("[v0] ✅ تم حفظ", orderItems.length, "صنف")
      }

      const users = db.getUsers()
      const admins = users.filter((u) => u.role === "admin")
      console.log("[v0] 👥 عدد المدراء:", admins.length)

      admins.forEach((admin) => {
        db.addNotification({
          user_id: admin.id,
          message: `طلبية جديدة من ${user?.full_name || user?.username}${customer?.name ? ` للعميل ${customer.name}` : ""}`,
          type: "order_submitted",
          is_read: false,
          related_order_id: newOrder.id,
        })
        console.log("[v0] 🔔 تم إرسال إشعار للمدير:", admin.username)
      })

      const savedOrders = db.getOrders()
      const savedOrder = savedOrders.find((o) => o.id === newOrder.id)
      if (savedOrder) {
        console.log("[v0] ✅ تم التأكد من حفظ الطلبية في قاعدة البيانات")
        console.log("[v0] ✅ الطلبية المحفوظة:", {
          id: savedOrder.id,
          status: savedOrder.status,
          images_count: savedOrder.images?.length || 0,
          has_text: !!savedOrder.text_order,
          customer: savedOrder.customer_name,
        })
      } else {
        console.error("[v0] ❌ خطأ: الطلبية لم تُحفظ في قاعدة البيانات!")
      }

      setSelectedCustomerId("")
      setOrderItems([])
      setAttachedImages([])
      setTextOrder("")

      console.log("[v0] 📤 === تم إرسال الطلبية بنجاح ===")
      alert('✅ تم إرسال الطلبية بنجاح\n\n📋 يمكنك متابعة حالتها من صفحة "طلبياتي"')
    } catch (error) {
      console.error("[v0] ❌ خطأ فادح أثناء إرسال الطلبية:", error)
      alert("❌ حدث خطأ أثناء إرسال الطلبية\nالرجاء المحاولة مرة أخرى")
    } finally {
      setSubmitting(false)
    }
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0)

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
          <h2 className="text-xl font-semibold">إنشاء طلبية جديدة</h2>
          <p className="text-sm text-muted-foreground">اختر العميل وأضف الأصناف</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">البيانات المتاحة:</span>
            <div className="flex gap-4 text-xs">
              <span className={customers.length > 0 ? "text-green-600" : "text-red-600"}>{customers.length} عميل</span>
              <span className={groups.length > 0 ? "text-green-600" : "text-red-600"}>{groups.length} مجموعة</span>
              <span className={products.length > 0 ? "text-green-600" : "text-red-600"}>{products.length} صنف</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>اختر العميل</Label>
            {customers.length === 0 ? (
              <p className="text-sm text-destructive">لا يوجد عملاء. قم بإضافة عملاء من قسم "إدارة العملاء" أولاً.</p>
            ) : (
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل / الصيدلية" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4">
          <Label className="mb-3 block">كتابة الطلبية نصياً (اختياري)</Label>
          <p className="mb-2 text-xs text-muted-foreground">يمكنك كتابة الطلبية بالكيبورد وإرسالها مباشرة</p>
          <Textarea
            value={textOrder}
            onChange={(e) => setTextOrder(e.target.value)}
            placeholder="اكتب تفاصيل الطلبية هنا..."
            className="min-h-[120px] resize-none bg-white"
            dir="rtl"
          />
          {textOrder.trim() && <p className="mt-2 text-xs text-green-600">✓ تم كتابة {textOrder.trim().length} حرف</p>}
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardContent className="p-4">
          <Label className="mb-3 block">إرفاق صور (اختياري)</Label>
          <p className="mb-2 text-xs text-muted-foreground">يمكنك إرسال صور فقط بدون اختيار أصناف</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 bg-white" onClick={handleCameraCapture}>
              <Camera className="ml-2 h-4 w-4" />
              التقاط صورة
            </Button>
            <Button type="button" variant="outline" className="flex-1 bg-white" onClick={handleImageUpload}>
              <Upload className="ml-2 h-4 w-4" />
              اختيار من المعرض
            </Button>
          </div>
          {attachedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {attachedImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`صورة ${index + 1}`}
                    className="h-20 w-full rounded-lg border-2 border-yellow-200 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -left-2 -top-2 h-6 w-6 rounded-full"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">الدرافت - اختر الأصناف</h3>
        {groups.length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardContent className="py-8 text-center">
              <p className="text-destructive font-semibold">لا توجد مجموعات منتجات</p>
              <Button variant="outline" size="sm" onClick={loadData} className="mt-3 bg-transparent">
                <RefreshCw className="ml-2 h-4 w-4" />
                إعادة تحميل البيانات
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {groups.map((group) => {
              const groupProducts = products.filter((p) => p.group_id === group.id)

              return (
                <AccordionItem key={group.id} value={group.id} className="rounded-lg border bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-right w-full">
                      {group.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={group.image || "/placeholder.svg"}
                            alt={group.name}
                            className="h-12 w-12 rounded-lg border-2 border-yellow-400 object-cover shadow-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{groupProducts.length} صنف</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {groupProducts.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">لا توجد أصناف في هذه المجموعة</p>
                    ) : (
                      <div className="space-y-2">
                        {groupProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="flex w-full items-center justify-between rounded-lg bg-muted p-3 text-right transition-colors hover:bg-muted/80"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {product.code && <span>كود: {product.code}</span>}
                                {product.price && <span>• {product.price} د.ع</span>}
                                {product.unit && <span>/ {product.unit}</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      {(orderItems.length > 0 || attachedImages.length > 0 || textOrder.trim()) && (
        <Card className="border-primary/50">
          <CardContent className="p-4">
            {orderItems.length > 0 && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">ملخص الطلبية</h3>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground numeric">
                          {item.unit_price > 0
                            ? `${item.unit_price} د.ع × ${item.quantity}`
                            : `الكمية: ${item.quantity}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                          className="w-20 text-center font-semibold numeric"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.total_price > 0 && (
                        <span className="min-w-[80px] text-left font-semibold numeric">
                          {item.total_price.toFixed(2)} د.ع
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {totalAmount > 0 && (
                  <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary numeric">{totalAmount.toFixed(2)} د.ع</span>
                  </div>
                )}
              </>
            )}
            {orderItems.length === 0 && attachedImages.length > 0 && (
              <div className="mb-3 text-center">
                <p className="text-sm text-muted-foreground">طلبية بصور فقط ({attachedImages.length} صورة)</p>
              </div>
            )}
            {textOrder.trim() && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">نص الطلبية:</p>
                <p className="text-sm">{textOrder.trim()}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={!selectedCustomerId && attachedImages.length === 0 && !textOrder.trim()}
                variant="outline"
                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ كمسودة
              </Button>
              <Button
                onClick={handleSendToManager}
                disabled={(!selectedCustomerId && attachedImages.length === 0 && !textOrder.trim()) || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="ml-2 h-4 w-4" />
                {submitting ? "جاري الإرسال..." : "إرسال للمدير"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              {selectedProduct?.code && `كود: ${selectedProduct.code}`}
              {selectedProduct?.price > 0 && (
                <span className="mt-1 block text-lg font-semibold text-primary numeric">
                  السعر: {selectedProduct.price} د.ع / {selectedProduct.unit}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">أدخل الكمية</Label>
              <Input
                id="quantity"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantityInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setQuantityInput(value)
                }}
                className="text-center text-2xl font-bold numeric"
                placeholder="0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmAddProduct()
                  }
                }}
              />
              {selectedProduct?.price > 0 && quantityInput && Number.parseInt(quantityInput) > 0 && (
                <p className="text-center text-sm text-muted-foreground numeric">
                  الإجمالي: {(selectedProduct.price * Number.parseInt(quantityInput)).toFixed(2)} د.ع
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              إلغاء
            </Button>
            <Button onClick={confirmAddProduct} className="bg-blue-600 hover:bg-blue-700">
              إضافة للطلبية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
