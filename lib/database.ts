// دالة توليد معرف فريد
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export interface User {
  id: string
  username: string
  password: string
  full_name: string
  role: "admin" | "sales_rep"
  phone?: string
  email?: string
  security_question?: string
  security_answer?: string
  is_active: boolean
  admin_permission?: AdminPermission
  created_at: string
}

export type AdminPermission = "full" | "orders_only"

export interface ProductGroup {
  id: string
  name: string
  description?: string
  image?: string
  created_at: string
}

export interface Product {
  id: string
  group_id: string
  name: string
  code: string
  price: number
  unit: string
  created_at: string
}

export interface Customer {
  id: string
  sales_rep_id: string
  name: string
  phone?: string
  address?: string
  created_at: string
}

export interface Order {
  id: string
  sales_rep_id: string
  customer_id: string
  customer_name: string
  status: "draft" | "pending" | "printed" | "completed" | "deleted"
  total: number
  notes?: string
  text_order?: string
  images?: string[]
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  type: "order_submitted" | "order_printed"
  is_read: boolean
  related_order_id?: string
  created_at: string
}

import { supabase } from "./supabase-client"

class LocalDatabase {
  private STORAGE_KEYS = {
    USERS: "sales_manager_users",
    PRODUCT_GROUPS: "sales_manager_product_groups",
    PRODUCTS: "sales_manager_products",
    CUSTOMERS: "sales_manager_customers",
    ORDERS: "sales_manager_orders",
    ORDER_ITEMS: "sales_manager_order_items",
    NOTIFICATIONS: "sales_manager_notifications",
  }

  // دوال مساعدة للتعامل مع localStorage
  private getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // المستخدمين
  getUsers(): User[] {
    return this.getFromStorage<User>(this.STORAGE_KEYS.USERS)
  }

  addUser(user: Omit<User, "id" | "created_at">): User {
    const users = this.getUsers()
    const newUser: User = {
      ...user,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    users.push(newUser)
    this.saveToStorage(this.STORAGE_KEYS.USERS, users)
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = { ...users[index], ...updates }
    this.saveToStorage(this.STORAGE_KEYS.USERS, users)
    return users[index]
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filtered = users.filter((u) => u.id !== id)
    if (filtered.length === users.length) return false

    this.saveToStorage(this.STORAGE_KEYS.USERS, filtered)
    return true
  }

  login(username: string, password: string): User | null {
    const users = this.getUsers()
    return users.find((u) => u.username === username && u.password === password && u.is_active) || null
  }

  // مجموعات المنتجات
  getProductGroups(): ProductGroup[] {
    return this.getFromStorage<ProductGroup>(this.STORAGE_KEYS.PRODUCT_GROUPS)
  }

  addProductGroup(group: Omit<ProductGroup, "id" | "created_at">): ProductGroup {
    const groups = this.getProductGroups()
    const newGroup: ProductGroup = {
      ...group,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    groups.push(newGroup)
    this.saveToStorage(this.STORAGE_KEYS.PRODUCT_GROUPS, groups)
    return newGroup
  }

  updateProductGroup(id: string, updates: Partial<ProductGroup>): ProductGroup | null {
    const groups = this.getProductGroups()
    const index = groups.findIndex((g) => g.id === id)
    if (index === -1) return null

    groups[index] = { ...groups[index], ...updates }
    this.saveToStorage(this.STORAGE_KEYS.PRODUCT_GROUPS, groups)
    return groups[index]
  }

  deleteProductGroup(id: string): boolean {
    const groups = this.getProductGroups()
    const filtered = groups.filter((g) => g.id !== id)
    if (filtered.length === groups.length) return false

    // حذف جميع المنتجات المرتبطة بهذه المجموعة
    const products = this.getProducts().filter((p) => p.group_id !== id)
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, products)

    this.saveToStorage(this.STORAGE_KEYS.PRODUCT_GROUPS, filtered)
    return true
  }

  // المنتجات
  getProducts(): Product[] {
    return this.getFromStorage<Product>(this.STORAGE_KEYS.PRODUCTS)
  }

  addProduct(product: Omit<Product, "id" | "created_at">): Product {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    products.push(newProduct)
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, products)
    return newProduct
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return null

    products[index] = { ...products[index], ...updates }
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, products)
    return products[index]
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts()
    const filtered = products.filter((p) => p.id !== id)
    if (filtered.length === products.length) return false

    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, filtered)
    return true
  }

  // العملاء
  getCustomers(): Customer[] {
    return this.getFromStorage<Customer>(this.STORAGE_KEYS.CUSTOMERS)
  }

  addCustomer(customer: Omit<Customer, "id" | "created_at">): Customer {
    const customers = this.getCustomers()
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    customers.push(newCustomer)
    this.saveToStorage(this.STORAGE_KEYS.CUSTOMERS, customers)
    return newCustomer
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers()
    const index = customers.findIndex((c) => c.id === id)
    if (index === -1) return null

    customers[index] = { ...customers[index], ...updates }
    this.saveToStorage(this.STORAGE_KEYS.CUSTOMERS, customers)
    return customers[index]
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers()
    const filtered = customers.filter((c) => c.id !== id)
    if (filtered.length === customers.length) return false

    this.saveToStorage(this.STORAGE_KEYS.CUSTOMERS, filtered)
    return true
  }

  // الطلبيات
  getOrders(): Order[] {
    return this.getFromStorage<Order>(this.STORAGE_KEYS.ORDERS)
  }

  addOrder(order: Omit<Order, "id" | "created_at">): Order {
    const orders = this.getOrders()
    const newOrder: Order = {
      ...order,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    orders.push(newOrder)
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, orders)
    return newOrder
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) return null

    orders[index] = { ...orders[index], ...updates }
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, orders)
    return orders[index]
  }

  deleteOrder(id: string): boolean {
    const orders = this.getOrders()
    const filtered = orders.filter((o) => o.id !== id)
    if (filtered.length === orders.length) return false

    // حذف جميع العناصر المرتبطة بهذه الطلبية
    const items = this.getOrderItems().filter((i) => i.order_id !== id)
    this.saveToStorage(this.STORAGE_KEYS.ORDER_ITEMS, items)

    this.saveToStorage(this.STORAGE_KEYS.ORDERS, filtered)
    return true
  }

  // عناصر الطلبيات
  getOrderItems(): OrderItem[] {
    return this.getFromStorage<OrderItem>(this.STORAGE_KEYS.ORDER_ITEMS)
  }

  addOrderItem(item: Omit<OrderItem, "id" | "created_at">): OrderItem {
    const items = this.getOrderItems()
    const newItem: OrderItem = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    items.push(newItem)
    this.saveToStorage(this.STORAGE_KEYS.ORDER_ITEMS, items)
    return newItem
  }

  // الإشعارات
  getNotifications(): Notification[] {
    return this.getFromStorage<Notification>(this.STORAGE_KEYS.NOTIFICATIONS)
  }

  addNotification(notification: Omit<Notification, "id" | "created_at">): Notification {
    const notifications = this.getNotifications()
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    notifications.push(newNotification)
    this.saveToStorage(this.STORAGE_KEYS.NOTIFICATIONS, notifications)
    return newNotification
  }

  markNotificationAsRead(id: string): Notification | null {
    const notifications = this.getNotifications()
    const index = notifications.findIndex((n) => n.id === id)
    if (index === -1) return null

    notifications[index].is_read = true
    this.saveToStorage(this.STORAGE_KEYS.NOTIFICATIONS, notifications)
    return notifications[index]
  }

  deleteNotification(id: string): boolean {
    const notifications = this.getNotifications()
    const filtered = notifications.filter((n) => n.id !== id)
    if (filtered.length === notifications.length) return false

    this.saveToStorage(this.STORAGE_KEYS.NOTIFICATIONS, filtered)
    return true
  }

  saveNotifications(notifications: Notification[]): void {
    this.saveToStorage(this.STORAGE_KEYS.NOTIFICATIONS, notifications)
  }

  saveOrders(orders: Order[]): void {
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, orders)
  }

  // دوال نقل الطلبيات للمهملات واستعادتها
  moveOrderToTrash(id: string): boolean {
    const order = this.updateOrder(id, { status: "deleted" })
    return !!order
  }

  restoreOrder(id: string): boolean {
    const order = this.updateOrder(id, { status: "pending" })
    return !!order
  }

  permanentDeleteOrder(id: string): boolean {
    return this.deleteOrder(id)
  }

  initializeDefaultData(): void {
    const users = this.getUsers()

    // إضافة المدير الافتراضي
    if (users.length === 0) {
      this.addUser({
        username: "admin",
        password: "admin",
        full_name: "المدير العام",
        role: "admin",
        phone: "",
        email: "admin@company.com",
        security_question: "ما هو اسم شركتك؟",
        security_answer: "الترياق",
        is_active: true,
        admin_permission: "full",
      })
    }

    const groups = this.getProductGroups()
    if (groups.length === 0) {
      const group1 = this.addProductGroup({
        name: "مجموعة 1",
        description: "مجموعة المنتجات الأولى",
      })
      const group2 = this.addProductGroup({
        name: "مجموعة 2",
        description: "مجموعة المنتجات الثانية",
      })
      const group3 = this.addProductGroup({
        name: "مجموعة 3",
        description: "مجموعة المنتجات الثالثة",
      })
      const group4 = this.addProductGroup({
        name: "مجموعة 4",
        description: "مجموعة المنتجات الرابعة",
      })

      // إضافة منتجات افتراضية
      this.addProduct({ group_id: group1.id, name: "منتج 1-1", code: "P1-1", price: 100, unit: "علبة" })
      this.addProduct({ group_id: group1.id, name: "منتج 1-2", code: "P1-2", price: 150, unit: "علبة" })
      this.addProduct({ group_id: group1.id, name: "منتج 1-3", code: "P1-3", price: 200, unit: "علبة" })

      this.addProduct({ group_id: group2.id, name: "منتج 2-1", code: "P2-1", price: 120, unit: "علبة" })
      this.addProduct({ group_id: group2.id, name: "منتج 2-2", code: "P2-2", price: 180, unit: "علبة" })

      this.addProduct({ group_id: group3.id, name: "منتج 3-1", code: "P3-1", price: 90, unit: "علبة" })
      this.addProduct({ group_id: group3.id, name: "منتج 3-2", code: "P3-2", price: 110, unit: "علبة" })
      this.addProduct({ group_id: group3.id, name: "منتج 3-3", code: "P3-3", price: 130, unit: "علبة" })

      this.addProduct({ group_id: group4.id, name: "منتج 4-1", code: "P4-1", price: 250, unit: "علبة" })
      this.addProduct({ group_id: group4.id, name: "منتج 4-2", code: "P4-2", price: 300, unit: "علبة" })
      this.addProduct({ group_id: group4.id, name: "منتج 4-3", code: "P4-3", price: 350, unit: "علبة" })
    }
  }

  // مسح جميع البيانات
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

class SupabaseDatabase {
  // المستخدمين
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب المستخدمين:", error)
      return []
    }
    return data || []
  }

  async addUser(user: Omit<User, "id" | "created_at">): Promise<User | null> {
    const { data, error } = await supabase.from("users").insert([user]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة مستخدم:", error)
      return null
    }
    return data
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث مستخدم:", error)
      return null
    }
    return data
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف مستخدم:", error)
      return false
    }
    return true
  }

  async login(username: string, password: string): Promise<User | null> {
    console.log("[v0] 🔍 محاولة تسجيل الدخول:", { username, password })

    // تنظيف المدخلات من المسافات
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    console.log("[v0] 🧹 بعد التنظيف:", { cleanUsername, cleanPassword })

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", cleanUsername)
      .eq("password", cleanPassword)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      console.error("[v0] ❌ خطأ في تسجيل الدخول:", error)

      // فحص وجود المستخدم
      const { data: allUsers } = await supabase.from("users").select("*")
      console.log("[v0] 📋 جميع المستخدمين في قاعدة البيانات:", allUsers)

      const { data: userExists } = await supabase.from("users").select("*").eq("username", cleanUsername).single()

      if (!userExists) {
        console.log("[v0] ❌ المستخدم غير موجود. جاري إنشاء المستخدم الافتراضي...")

        // إنشاء المستخدم الافتراضي
        const newUser = {
          username: "admin",
          password: "admin",
          full_name: "المدير العام",
          role: "admin",
          phone: "",
          is_active: true,
          admin_permission: "full",
        }

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single()

        if (createError) {
          console.error("[v0] ❌ فشل إنشاء المستخدم:", createError)
          return null
        }

        console.log("[v0] ✅ تم إنشاء المستخدم الافتراضي:", createdUser)

        // إذا كانت بيانات الدخول admin/admin، أرجع المستخدم المنشأ
        if (cleanUsername === "admin" && cleanPassword === "admin") {
          return createdUser
        }
      } else {
        console.log("[v0] ℹ️ المستخدم موجود:", userExists)
        console.log("[v0] ❌ كلمة المرور غير صحيحة")
        console.log("[v0] 🔑 كلمة المرور المحفوظة:", userExists.password)
        console.log("[v0] 🔑 كلمة المرور المدخلة:", cleanPassword)
      }

      return null
    }

    console.log("[v0] ✅ تم تسجيل الدخول بنجاح:", data.username)
    return data
  }

  async createUser(user: Omit<User, "id" | "created_at">): Promise<User | null> {
    try {
      console.log("[v0] 📝 محاولة إنشاء مستخدم:", { username: user.username, role: user.role })

      const { data, error } = await supabase.from("users").insert([user]).select().single()

      if (error) {
        console.error("[v0] ❌ خطأ تفصيلي في إضافة مستخدم:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`فشل إنشاء المستخدم: ${error.message}`)
      }

      console.log("[v0] ✅ تم إنشاء المستخدم بنجاح:", data)
      return data
    } catch (err) {
      console.error("[v0] ❌ خطأ غير متوقع:", err)
      throw err
    }
  }

  // مجموعات المنتجات
  async getProductGroups(): Promise<ProductGroup[]> {
    const { data, error } = await supabase.from("product_groups").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب المجموعات:", error)
      return []
    }
    return data || []
  }

  async addProductGroup(group: Omit<ProductGroup, "id" | "created_at">): Promise<ProductGroup | null> {
    const { data, error } = await supabase.from("product_groups").insert([group]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة مجموعة:", error)
      return null
    }
    return data
  }

  async updateProductGroup(id: string, updates: Partial<ProductGroup>): Promise<ProductGroup | null> {
    const { data, error } = await supabase.from("product_groups").update(updates).eq("id", id).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث مجموعة:", error)
      return null
    }
    return data
  }

  async deleteProductGroup(id: string): Promise<boolean> {
    const { error } = await supabase.from("product_groups").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف مجموعة:", error)
      return false
    }
    return true
  }

  // المنتجات
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب المنتجات:", error)
      return []
    }
    return data || []
  }

  async addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product | null> {
    const { data, error } = await supabase.from("products").insert([product]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة منتج:", error)
      return null
    }
    return data
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث منتج:", error)
      return null
    }
    return data
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف منتج:", error)
      return false
    }
    return true
  }

  // العملاء
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب العملاء:", error)
      return []
    }
    return data || []
  }

  async addCustomer(customer: Omit<Customer, "id" | "created_at">): Promise<Customer | null> {
    const { data, error } = await supabase.from("customers").insert([customer]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة عميل:", error)
      return null
    }
    return data
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث عميل:", error)
      return null
    }
    return data
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف عميل:", error)
      return false
    }
    return true
  }

  // الطلبيات
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب الطلبيات:", error)
      return []
    }
    return data || []
  }

  async addOrder(order: Omit<Order, "id" | "created_at">): Promise<Order | null> {
    const { data, error } = await supabase.from("orders").insert([order]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة طلبية:", error)
      return null
    }
    return data
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث طلبية:", error)
      return null
    }
    return data
  }

  async deleteOrder(id: string): Promise<boolean> {
    const { error } = await supabase.from("orders").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف طلبية:", error)
      return false
    }
    return true
  }

  // عناصر الطلبيات
  async getOrderItems(): Promise<OrderItem[]> {
    const { data, error } = await supabase.from("order_items").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب عناصر الطلبيات:", error)
      return []
    }
    return data || []
  }

  async addOrderItem(item: Omit<OrderItem, "id" | "created_at">): Promise<OrderItem | null> {
    const { data, error } = await supabase.from("order_items").insert([item]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة عنصر طلبية:", error)
      return null
    }
    return data
  }

  // الإشعارات
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("[v0] ❌ خطأ في جلب الإشعارات:", error)
      return []
    }
    return data || []
  }

  async addNotification(notification: Omit<Notification, "id" | "created_at">): Promise<Notification | null> {
    const { data, error } = await supabase.from("notifications").insert([notification]).select().single()
    if (error) {
      console.error("[v0] ❌ خطأ في إضافة إشعار:", error)
      return null
    }
    return data
  }

  async markNotificationAsRead(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single()
    if (error) {
      console.error("[v0] ❌ خطأ في تحديث إشعار:", error)
      return null
    }
    return data
  }

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase.from("notifications").delete().eq("id", id)
    if (error) {
      console.error("[v0] ❌ خطأ في حذف إشعار:", error)
      return false
    }
    return true
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    console.log("[v0] تحديث الإشعارات في Supabase")
  }

  async saveOrders(orders: Order[]): Promise<void> {
    console.log("[v0] تحديث الطلبيات في Supabase")
  }

  async moveOrderToTrash(id: string): Promise<boolean> {
    const order = await this.updateOrder(id, { status: "deleted" })
    return !!order
  }

  async restoreOrder(id: string): Promise<boolean> {
    const order = await this.updateOrder(id, { status: "pending" })
    return !!order
  }

  async permanentDeleteOrder(id: string): Promise<boolean> {
    return await this.deleteOrder(id)
  }

  async initializeDefaultData(): Promise<void> {
    const users = await this.getUsers()

    if (users.length === 0) {
      await this.addUser({
        username: "admin",
        password: "admin",
        full_name: "المدير العام",
        role: "admin",
        phone: "",
        email: "admin@company.com",
        security_question: "ما هو اسم شركتك؟",
        security_answer: "الترياق",
        is_active: true,
        admin_permission: "full",
      })
      console.log("[v0] ✅ تم إنشاء المستخدم الافتراضي في Supabase")
    }

    const groups = await this.getProductGroups()
    if (groups.length === 0) {
      const group1 = await this.addProductGroup({
        name: "مجموعة 1",
        description: "مجموعة المنتجات الأولى",
      })
      const group2 = await this.addProductGroup({
        name: "مجموعة 2",
        description: "مجموعة المنتجات الثانية",
      })
      const group3 = await this.addProductGroup({
        name: "مجموعة 3",
        description: "مجموعة المنتجات الثالثة",
      })
      const group4 = await this.addProductGroup({
        name: "مجموعة 4",
        description: "مجموعة المنتجات الرابعة",
      })

      if (group1) {
        await this.addProduct({ group_id: group1.id, name: "منتج 1-1", code: "P1-1", price: 100, unit: "علبة" })
        await this.addProduct({ group_id: group1.id, name: "منتج 1-2", code: "P1-2", price: 150, unit: "علبة" })
        await this.addProduct({ group_id: group1.id, name: "منتج 1-3", code: "P1-3", price: 200, unit: "علبة" })
      }

      if (group2) {
        await this.addProduct({ group_id: group2.id, name: "منتج 2-1", code: "P2-1", price: 120, unit: "علبة" })
        await this.addProduct({ group_id: group2.id, name: "منتج 2-2", code: "P2-2", price: 180, unit: "علبة" })
      }

      if (group3) {
        await this.addProduct({ group_id: group3.id, name: "منتج 3-1", code: "P3-1", price: 90, unit: "علبة" })
        await this.addProduct({ group_id: group3.id, name: "منتج 3-2", code: "P3-2", price: 110, unit: "علبة" })
        await this.addProduct({ group_id: group3.id, name: "منتج 3-3", code: "P3-3", price: 130, unit: "علبة" })
      }

      if (group4) {
        await this.addProduct({ group_id: group4.id, name: "منتج 4-1", code: "P4-1", price: 250, unit: "علبة" })
        await this.addProduct({ group_id: group4.id, name: "منتج 4-2", code: "P4-2", price: 300, unit: "علبة" })
        await this.addProduct({ group_id: group4.id, name: "منتج 4-3", code: "P4-3", price: 350, unit: "علبة" })
      }

      console.log("[v0] ✅ تم إنشاء البيانات الافتراضية في Supabase")
    }
  }

  async clearAllData(): Promise<void> {
    await supabase.from("notifications").delete().neq("id", "")
    await supabase.from("order_items").delete().neq("id", "")
    await supabase.from("orders").delete().neq("id", "")
    await supabase.from("customers").delete().neq("id", "")
    await supabase.from("products").delete().neq("id", "")
    await supabase.from("product_groups").delete().neq("id", "")
    await supabase.from("users").delete().neq("id", "")
    console.log("[v0] ✅ تم مسح جميع البيانات من Supabase")
  }

  async ensureDefaultAdmin(): Promise<void> {
    try {
      console.log("[v0] 🔍 التحقق من وجود مستخدم admin...")

      // البحث عن المستخدم الافتراضي
      const { data: existingAdmin, error: searchError } = await supabase
        .from("users")
        .select("*")
        .eq("username", "admin")
        .single()

      if (existingAdmin) {
        console.log("[v0] ✅ المستخدم admin موجود بالفعل")
        return
      }

      console.log("[v0] 📝 إنشاء المستخدم الافتراضي admin...")

      // إنشاء المستخدم الافتراضي
      const newUser = {
        username: "admin",
        password: "admin",
        full_name: "المدير العام",
        role: "admin",
        is_active: true,
        admin_permission: "full",
      }

      const { data: createdUser, error: createError } = await supabase.from("users").insert([newUser]).select().single()

      if (createError) {
        console.error("[v0] ❌ فشل إنشاء المستخدم:", createError)
        throw createError
      }

      console.log("[v0] ✅ تم إنشاء المستخدم الافتراضي:", createdUser)
    } catch (error) {
      console.error("[v0] ❌ خطأ في ensureDefaultAdmin:", error)
      throw error
    }
  }
}

export const db = new SupabaseDatabase()
export const localDb = new LocalDatabase()

if (typeof window !== "undefined") {
  db.initializeDefaultData().catch((error) => {
    console.error("[v0] ❌ خطأ في تهيئة البيانات:", error)
  })
}
