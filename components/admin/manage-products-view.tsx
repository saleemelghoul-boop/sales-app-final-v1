"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { db, type Product, type ProductGroup } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FolderPlus, Package, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ManageProductsView() {
  const [groups, setGroups] = useState<ProductGroup[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [groupForm, setGroupForm] = useState({ name: "", description: "", image: "" })
  const [productForm, setProductForm] = useState({ name: "", code: "", price: "", unit: "", group_id: "" })

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      loadData()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      console.log("[v0] 📦 Loading product groups and products")
      const loadedGroups = await db.getProductGroups()
      const loadedProducts = await db.getProducts()

      if (!Array.isArray(loadedGroups)) {
        console.error("[v0] ❌ Groups is not an array:", loadedGroups)
        setGroups([])
      } else {
        console.log("[v0] ✅ Loaded groups:", loadedGroups.length)
        setGroups(loadedGroups)
      }

      if (!Array.isArray(loadedProducts)) {
        console.error("[v0] ❌ Products is not an array:", loadedProducts)
        setProducts([])
      } else {
        console.log("[v0] ✅ Loaded products:", loadedProducts.length)
        setProducts(loadedProducts)
      }
    } catch (error) {
      console.error("[v0] ❌ Error loading data:", error)
      setGroups([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const startEditGroup = (group: ProductGroup) => {
    setEditingGroup(group)
    setGroupForm({ name: group.name, description: group.description || "", image: group.image || "" })
    setIsGroupDialogOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setGroupForm({ ...groupForm, image: base64String })
      console.log("[v0] 📸 Image uploaded successfully")
    }
    reader.readAsDataURL(file)
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      code: product.code,
      price: product.price.toString(),
      unit: product.unit,
      group_id: product.group_id,
    })
    setIsProductDialogOpen(true)
  }

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingGroup) {
        await db.updateProductGroup(editingGroup.id, {
          name: groupForm.name,
          description: groupForm.description,
          image: groupForm.image,
        })
        alert("تم تعديل المجموعة بنجاح!")
      } else {
        await db.addProductGroup({
          name: groupForm.name,
          description: groupForm.description,
          image: groupForm.image,
        })
        alert("تم إضافة المجموعة بنجاح!")
      }
      setGroupForm({ name: "", description: "", image: "" })
      setEditingGroup(null)
      setIsGroupDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error("[v0] ❌ Error saving group:", error)
      alert("حدث خطأ أثناء حفظ المجموعة")
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] 📦 Saving product:", productForm)

    if (!productForm.group_id) {
      alert("الرجاء اختيار المجموعة أولاً")
      return
    }

    try {
      if (editingProduct) {
        console.log("[v0] ✏️ Updating product:", editingProduct.id)
        await db.updateProduct(editingProduct.id, {
          group_id: productForm.group_id,
          name: productForm.name,
          code: productForm.code,
          price: productForm.price ? Number.parseFloat(productForm.price) : 0,
          unit: productForm.unit,
        })
        alert("تم تعديل الصنف بنجاح!")
      } else {
        console.log("[v0] ➕ Adding new product")
        const newProduct = await db.addProduct({
          group_id: productForm.group_id,
          name: productForm.name,
          code: productForm.code,
          price: productForm.price ? Number.parseFloat(productForm.price) : 0,
          unit: productForm.unit,
        })
        console.log("[v0] ✅ Product added:", newProduct)
        alert("تم إضافة الصنف بنجاح!")
      }
      setProductForm({ name: "", code: "", price: "", unit: "", group_id: "" })
      setEditingProduct(null)
      setIsProductDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error("[v0] ❌ Error saving product:", error)
      alert("حدث خطأ أثناء حفظ الصنف: " + (error as Error).message)
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأصناف المرتبطة بها.")) {
      db.deleteProductGroup(groupId)
      loadData()
      alert("تم حذف المجموعة وجميع أصنافها")
    }
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      db.deleteProduct(productId)
      loadData()
      alert("تم حذف الصنف")
    }
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
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
          <h2 className="text-xl font-semibold">إدارة الدرافت</h2>
          <p className="text-sm text-muted-foreground">المجموعات والأصناف</p>
        </div>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">المجموعات</TabsTrigger>
          <TabsTrigger value="products">الأصناف</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isGroupDialogOpen}
              onOpenChange={(open) => {
                setIsGroupDialogOpen(open)
                if (!open) {
                  setEditingGroup(null)
                  setGroupForm({ name: "", description: "", image: "" })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="shadow-[0_0_0_2px_oklch(0.7_0.15_60)]">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مجموعة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGroup ? "تعديل المجموعة" : "إضافة مجموعة جديدة"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group_name">اسم المجموعة</Label>
                    <Input
                      id="group_name"
                      placeholder="مثال: أدوية القلب"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group_desc">الوصف</Label>
                    <Textarea
                      id="group_desc"
                      placeholder="وصف اختياري"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group_image">صورة المجموعة (اختياري)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="group_image"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                    </div>
                    {groupForm.image && (
                      <div className="relative mt-2">
                        <img
                          src={groupForm.image || "/placeholder.svg"}
                          alt="Preview"
                          className="h-32 w-full rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => setGroupForm({ ...groupForm, image: "" })}
                          className="absolute left-2 top-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full shadow-[0_0_0_2px_oklch(0.7_0.15_60)]">
                    {editingGroup ? "حفظ التعديلات" : "إضافة المجموعة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderPlus className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">لا توجد مجموعات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const groupProducts = products.filter((p) => p.group_id === group.id)
                const isExpanded = expandedGroups.has(group.id)

                return (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div
                        className="flex cursor-pointer items-start gap-3"
                        onClick={() => toggleGroupExpansion(group.id)}
                      >
                        {group.image && (
                          <img
                            src={group.image || "/placeholder.svg"}
                            alt={group.name}
                            className="h-16 w-16 rounded-lg object-cover shadow-[0_0_0_2px_oklch(0.7_0.15_60)]"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{group.name}</h3>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          {group.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground numeric">
                            عدد الأصناف: {groupProducts.length}
                          </p>
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditGroup(group)}
                            className="shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && groupProducts.length > 0 && (
                        <div className="mt-4 space-y-2 border-t pt-4">
                          <h4 className="text-sm font-semibold text-primary">الأصناف:</h4>
                          {groupProducts.map((product) => (
                            <Card key={product.id} className="bg-muted/30">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{product.name}</h4>
                                    {product.code && (
                                      <p className="text-xs text-muted-foreground">كود: {product.code}</p>
                                    )}
                                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                      {product.price > 0 && <span className="numeric">{product.price} د.ع</span>}
                                      {product.unit && <span>{product.unit}</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        startEditProduct(product)
                                      }}
                                      className="shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteProduct(product.id)
                                      }}
                                      className="shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {isExpanded && groupProducts.length === 0 && (
                        <div className="mt-4 border-t pt-4 text-center">
                          <p className="text-sm text-muted-foreground">لا توجد أصناف في هذه المجموعة</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isProductDialogOpen}
              onOpenChange={(open) => {
                setIsProductDialogOpen(open)
                if (!open) {
                  setEditingProduct(null)
                  setProductForm({ name: "", code: "", price: "", unit: "", group_id: "" })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" disabled={groups.length === 0} className="shadow-[0_0_0_2px_oklch(0.7_0.15_60)]">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة صنف
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "تعديل الصنف" : "إضافة صنف جديد"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_group">المجموعة</Label>
                    <Select
                      value={productForm.group_id}
                      onValueChange={(value) => setProductForm({ ...productForm, group_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المجموعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_name">اسم الصنف</Label>
                    <Input
                      id="product_name"
                      placeholder="مثال: أسبرين 100 ملغ"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_code">الكود</Label>
                    <Input
                      id="product_code"
                      placeholder="مثال: ASP-100"
                      value={productForm.code}
                      onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                      className="text-right"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product_price">السعر</Label>
                      <Input
                        id="product_price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="text-right numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_unit">الوحدة</Label>
                      <Input
                        id="product_unit"
                        placeholder="علبة، قطعة..."
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full shadow-[0_0_0_2px_oklch(0.7_0.15_60)]">
                    {editingProduct ? "حفظ التعديلات" : "إضافة الصنف"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">قم بإضافة مجموعة أولاً</p>
              </CardContent>
            </Card>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">لا توجد أصناف</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const groupProducts = products.filter((p) => p.group_id === group.id)
                if (groupProducts.length === 0) return null

                return (
                  <div key={group.id} className="space-y-2">
                    <h3 className="font-semibold text-primary">{group.name}</h3>
                    <div className="space-y-2">
                      {groupProducts.map((product) => (
                        <Card key={product.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{product.name}</h4>
                                {product.code && <p className="text-xs text-muted-foreground">كود: {product.code}</p>}
                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                  {product.price > 0 && <span className="numeric">{product.price} د.ع</span>}
                                  {product.unit && <span>{product.unit}</span>}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => startEditProduct(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
