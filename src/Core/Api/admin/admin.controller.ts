import { NextFunction, Request, Response } from "express"
import { errorMessages, successMessages } from "../../App/messages"
import { UserEntity } from "../../../DAL/entities/User.entity"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AppConfig } from "../../../consts"
import { RegisterDto } from "../auth/auth.dto"
import { validate } from "class-validator"

const createUser = async (req:Request, res:Response, next:NextFunction) => {
    const {email, phone_number, password, confirm_password, user_role} = req.body
    
        const data = new RegisterDto()
        data.email = email
        data.phone_number = phone_number
        data.password = password
        data.confirm_password = confirm_password
    
        const validData = await validate(data)
        if (validData.length > 0) {
            return next( res.status(422).json({
                message: errorMessages[422],
                errors: validData.map((error) => ({
                    field: error.property,
                    message: Object.values(error.constraints || {})[0],
                })),
            }))
        }
        try {
            const existUser = await UserEntity.findOne({ where:[{ email: email },{ phone_number: phone_number }]})
            if (existUser) {
                return next( res.status(409).json({
                    message: errorMessages[409],
                    error: "User already exists",
                }))
            }
            const hasedPassword = bcrypt.hashSync(password, 10)
            const newUser = await UserEntity.create({
                email,
                phone_number,
                password: hasedPassword,
                user_role
            }).save()
            return next(res.status(201).json({
                message: successMessages[201],
                data: {
                    email: newUser.email,
                    phone_number: newUser.phone_number,
                }
            }))
    
        } catch (error) {
            return next( res.status(500).json({
                errors: error,
                message: errorMessages[500],
            }))
        }
    
}
const getOrders = async (req:Request, res:Response, next:NextFunction) => {}
const deleteUser = async (req:Request, res:Response, next:NextFunction) => {
    const {id} = req.params
    try {
        const existUser = await UserEntity.findOne({where: {id}})

        if (!existUser) {
            return next(res.status(404).json({
                message: errorMessages[404]
            }))
        }
        await existUser.softRemove()
        return next(res.json({
            message: "Istifadəçi uğurla silindi."
        }))
    } catch (error) {
        return next(res.status(500).json({
            message: errorMessages[500],
            error
        }))
    }
}

export const AdminController = () => ({
    createUser,
    getOrders,
    deleteUser
})