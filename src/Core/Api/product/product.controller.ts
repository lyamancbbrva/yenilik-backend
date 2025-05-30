import { NextFunction, Request, Response } from "express"
import { ProductDto } from "./product.dto"
import { validate } from "class-validator"
import { errorMessages } from "../../App/messages"
import { ProductEntity } from "../../../DAL/entities/Product.entity"
import { SubcategoryEntity } from "../../../DAL/entities/Subcategory.entity"

const create = async (req:Request, res:Response, next:NextFunction) => {
    const {name,description, price, stock, subcategory_id, discounted_price, discounted_percentage, is_top_seller} = req.body
    const img = req.file
    const data = new ProductDto()
    data.name = name
    data.price = price
    data.description = description
    data.stock = stock
    data.subcategory_id = subcategory_id
    data.discounted_price = discounted_price
    data.discounted_percentage = discounted_percentage
    data.is_top_seller = is_top_seller
    const validData = await validate(data)

    if (validData.length > 0) {
        return next(res.status(422).json({
			message: "Validation Error",
			errors: validData.map((error) => ({
				field: error.property,
				message: Object.values(error.constraints || {})[0],
			})),
		}))
    }
    
    try {
        const img_name = img?.filename || 'yenilik.png'
        const existSubcat = await SubcategoryEntity.findOne({
            where: {id: subcategory_id}
        })
        if (!existSubcat) {
            return next(res.status(404).json({
                message: "Mövcud alt kateqoriya tapılmadı"
            }))
        }
        const newProduct = await ProductEntity.create({
            name,description, price, stock, subcategory:{id: subcategory_id}, discounted_price, discounted_percentage, is_top_seller,
            img_url: img_name
        }).save()
        return next(res.status(201).json({
            message: "Product created succesfully",
            data: newProduct
        }))
        
    } catch (error) {
        return next(res.status(500).json({
            message: errorMessages[500],
            error
        }))
    }
}
const update = async (req:Request, res:Response, next:NextFunction) => {
    const {name, description, price, discounted_percentage, subcategory_id, discounted_price, is_top_seller,  stock} = req.body
    const {id} = req.params
    const img = req.file
    const data = new ProductDto()
    data.description = description
    data.discounted_percentage = discounted_percentage
    data.discounted_price = discounted_price
    data.is_top_seller = is_top_seller
    data.name = name
    data.price = price
    data.subcategory_id = subcategory_id
    data.stock = stock
    
    const validData = await validate(data)
    if (validData.length > 0) {
        return next(res.status(422).json({
			message: "Validation Error",
			errors: validData.map((error) => ({
				field: error.property,
				message: Object.values(error.constraints || {})[0],
			})),
		}))
    }
    try {
        const existProduct = await ProductEntity.findOne({
            where: {id}
        })
        if (!existProduct) {
            return next(res.status(404).json({
                message: "Məhsul mövcud deyil"
            }))
        }
        const existSubcat = await SubcategoryEntity.findOne({
            where: {id: subcategory_id}
        })
        if (!existSubcat) {
            return next(res.status(404).json({
                message: "Altkateqoriya mövcud deyil"
            }))
        }

        await ProductEntity.update(id, {name, description, price, discounted_percentage, subcategory:{id: subcategory_id}, discounted_price, is_top_seller,  stock, img_url: img?.filename})
        return next(res.json({
            message: "Məhsul uğurla yeniləndi"
        }))

    } catch (error) {
        return next(res.status(500).json({
            message: errorMessages[500],
            error
        }))
    }

}
const deletee = async (req:Request, res:Response, next:NextFunction) => {
    const {id} = req.params
    try {
        const existProduct = ProductEntity.findOne({where: {id}})
        
        if (!existProduct) {
            return next(res.status(404).json({
                message: errorMessages[404]
            }))
        }
        await ProductEntity.delete(id)
        return next(res.status(200).json({
            message: "Product deleted succesfully"
        }))
    } catch (error) {
        return next(res.status(500).json({
            message: errorMessages[500],
            error
        }))
    }
}
const get = async (req: Request, res: Response, next: NextFunction) => {
    let limit = parseInt(req.query.limit as string) || 10; 
    const page = parseInt(req.query.page as string) || 1;   
    const per_page = parseInt(req.query.page as string) || 10; 

    const skip = (page - 1) * limit;

    try {
        if (limit>200) {
            limit = 200
        }
        const [products, total] = await ProductEntity.findAndCount({
            // relations: ['category', 'subcategories'],
            skip,
            take: limit,
        });

        const totalPages = Math.ceil(limit / per_page);

        return next(res.json({
            data: products,
            meta: {
                totalItems: limit,
                currentPage: page,
                totalPages,
                perPage: Math.ceil(limit/totalPages),
            }
        }));
    } catch (error) {
        console.log(error)
        return next(res.status(500).json({
            message: errorMessages[500],
            error,
        }));
    }
};
const getById = async (req:Request, res:Response, next:NextFunction) => {
    const {id} = req.params
    try {
        const existProduct = ProductEntity.findOne({where: {id}, select: ['name', 'id', "description", 'discounted_percentage', 'discounted_price', 'price', 'is_top_seller', 'stock', 'subcategory'], relations: ['subcategory']})
        if (!existProduct) {
            return next(res.status(404).json({
                message: errorMessages[404],
            }))
        }
        return next(res.status(200).json({
            message: "OK",
            data: existProduct
        }))
    } catch (error) {
        return next(res.status(500).json({
            message: errorMessages[500],
            error
        }))
    }
}
const search = async (req:Request, res:Response, next:NextFunction) => {
    const {} = req.params
}

export const ProductController = () => ({
    create, update, deletee, get, getById, search
})