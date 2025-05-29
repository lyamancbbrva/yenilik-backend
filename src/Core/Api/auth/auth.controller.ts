import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { LoginDto, RegisterDto } from "./auth.dto";
import { errorMessages, successMessages } from "../../App/messages";
import { UserEntity } from "../../../DAL/entities/User.entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppConfig } from "../../../consts";
import { RefreshTokenEntity } from "../../../DAL/entities/RefreshToken.entity";

const register = async (req: Request, res: Response, next: NextFunction) => {
	const { email, phone_number, password, confirm_password } =
		req.body; 

	const data = new RegisterDto();
	data.email = email;
	data.phone_number = phone_number;
	data.password = password;
	data.confirm_password = confirm_password;

	const validData = await validate(data);
	if (validData.length > 0) {
		return next(
			res.status(422).json({
				message: errorMessages[422],
				errors: validData.map((error) => ({
					field: error.property,
					message: Object.values(error.constraints || {})[0],
				})),
			})
		);
	}
	try {
		const existUser = await UserEntity.findOne({
			where: [{ email: email }, { phone_number: phone_number }],
		});
		if (existUser) {
			return next(
				res.status(409).json({
					message: errorMessages[409],
					error: "User already exists",
				})
			);
		}
		const hasedPassword = bcrypt.hashSync(password, 10);
		const newUser = await UserEntity.create({
			email,
	 		phone_number,
			password: hasedPassword,
		}).save();
		
		return next(res.status(201).json({
			message: successMessages[201],
			data: {
				email: newUser.email,
				phone_number: newUser.phone_number,
			},
			status: 201
		}))
	} catch (error) {
		return next(
			res.status(500).json({
				errors: error,
				message: errorMessages[500],
			})
		);
	}
};
const login = async (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body;
	const jwt_secret = AppConfig.JWT_SECRET;
	const jwt_refresh_secret = AppConfig.JWT_REFRESH_SECRET;
	const data = new LoginDto();
	data.email = email;
	data.password = password;
	const validData = await validate(data);

	if (validData.length > 0) {
		return next(
			res.status(422).json({
				message: errorMessages[422],
				errors: validData.map((error) => ({
					field: error.property,
					message: Object.values(error.constraints || {})[0],
				})),
			})
		);
	}

	try {
		const existUser = await UserEntity.findOne({ where: { email } });
		if (!existUser) {
			return next(
				res.status(401).json({
					message: errorMessages[401],
					error: "Email or password is incorrect",
				})
			);
		}
		const isPasswordValid = bcrypt.compareSync(
			password,
			existUser.password
		);
		if (!isPasswordValid) {
			return next(
				res.status(401).json({
					message: errorMessages[401],
					error: "Email or password is incorrect",
				})
			);
		}
		const payload = {
			id: existUser.id,
		};
		if (!jwt_secret || !jwt_refresh_secret) {
			return next(
				res.status(500).json({
					message: errorMessages[500],
					errors: "JWT secret is not defined",
				})
			);
		}
		const token = jwt.sign(payload, jwt_secret, { expiresIn: "15m" });
		const refreshToken = jwt.sign(payload, jwt_refresh_secret, {
			expiresIn: "7d",
		});
		await RefreshTokenEntity.save({
			refresh_token: refreshToken,
			user: existUser,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
		})
			.status(200)
			.json({
				message: successMessages[200],
				token,
			});
	} catch (error) {
		return next(
			res.status(500).json({
				message: errorMessages[500],
				errors: error,
			})
		);
	}
};
const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const refresh_token = req.cookies.refreshToken;
		const secret_key = AppConfig.JWT_REFRESH_SECRET;
		if (!secret_key) {
			return next(
				res.status(401).json({
					message: "Secret key is undefined",
				})
			);
		}
		if (!refresh_token) {
			return next(
				res.status(401).json({
					message: "Refresh token missing",
				})
			);
		}
		const payload = jwt.verify(refresh_token, secret_key);

		if (!payload || typeof payload === "string" || !payload.id) {
			return next(
				res.status(403).json({ message: "Invalid refresh token" })
			);
		}

		const existRefreshToken = await RefreshTokenEntity.findOne({
			where: { refresh_token },
		});
		if (!existRefreshToken)
			return next(
				res.status(403).json({ message: "Invalid refresh token" })
			);

		const new_token = jwt.sign({ id: payload.id }, secret_key, {
			expiresIn: "15m",
		});
		return next(
			res.json({
				token: new_token,
			})
		);
	} catch (error) {
		return next(
			res.status(403).json({
				message: "Invalid refresh token",
			})
		);
	}
};

export const AuthController = () => ({
	register,
	login,
	refreshToken,
});
