import { Router } from "express";
import { CategoryController } from "./category.controller";
import { roleCheck, useAuth } from "../../App/middlewares/auth.middleware";

export const categoryRouter = Router()
const controller = CategoryController()

categoryRouter.post('/', useAuth, roleCheck(['admin']), controller.create)
categoryRouter.put('/:id', useAuth, roleCheck(['admin']),controller.update)
categoryRouter.delete('/:id', useAuth,roleCheck(['admin']), controller.deletee)
categoryRouter.get('/', controller.get)
categoryRouter.get('/:id', controller.getById)

