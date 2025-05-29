import { Router } from "express";
import { SubcategoryController } from "./subcategory.controller";
import { roleCheck, useAuth } from "../../App/middlewares/auth.middleware";

export const subcategoryRouter = Router()
const controller = SubcategoryController()  

subcategoryRouter.post('/', useAuth,roleCheck(['admin']), controller.create)
subcategoryRouter.put('/:id', useAuth,roleCheck(['admin']), controller.update)
subcategoryRouter.delete('/:id', useAuth,roleCheck(['admin']), controller.deletee)
subcategoryRouter.get('/', controller.get)
subcategoryRouter.get('/:id', controller.getById)