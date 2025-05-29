import { Router } from "express";
import { AdminController } from "../../../Core/Api/admin/admin.controller";
import { roleCheck } from "../../App/middlewares/auth.middleware";

export const adminRouter = Router()

const controller = AdminController()

adminRouter.post('/create-user', roleCheck(['admin']), controller.createUser)
adminRouter.get('/orders', roleCheck(['admin']), controller.getOrders)
adminRouter.delete('/user/:id', roleCheck(['admin']), controller.deleteUser)