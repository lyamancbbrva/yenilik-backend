import { Router } from "express";
import { authRouter } from "../Core/Api/auth/auth.routes";
import { categoryRouter } from "../Core/Api/category/category.routes";
import { productRouter } from "../Core/Api/product/product.routes";
import { subcategoryRouter } from "../Core/Api/subcategory/subcategory.routes";
import { adminRouter } from "../Core/Api/admin/admin.routes";
import { orderRouter } from "../Core/Api/order/order.routes";
import { roleCheck, useAuth } from "../Core/App/middlewares/auth.middleware";

export const v1Router = Router()

v1Router.use('/auth', authRouter)
v1Router.use('/category', categoryRouter)
v1Router.use('/product', productRouter)
v1Router.use('/subcategory', subcategoryRouter)
v1Router.use('/admin', useAuth, roleCheck(['superadmin']), adminRouter) 
v1Router.use('/order', useAuth, orderRouter)
