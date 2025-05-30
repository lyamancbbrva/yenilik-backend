import { Router } from "express";
import { ProductController } from "./product.controller";
import { roleCheck, useAuth } from "../../App/middlewares/auth.middleware";
import { upload } from "../../App/middlewares/multer.middleware";

export const productRouter = Router()
const controller = ProductController()

productRouter.post('/',  upload.single('img'), controller.create)
productRouter.put('/:id', roleCheck(['admin']),controller.update)
productRouter.delete('/:id',roleCheck(['admin']), controller.deletee)
productRouter.get('/', controller.get)
productRouter.get('/:id', controller.getById)
