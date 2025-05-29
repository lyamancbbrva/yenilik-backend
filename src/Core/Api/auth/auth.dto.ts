import { IsDefined, IsEmail, MinLength, Matches, IsString, ValidateIf } from "class-validator";

export class RegisterDto {
    @IsDefined({ message: "Email boş ola bilməz!" })
    @IsEmail({}, { message: "Düzgün email daxil edin!" })
    email!: string;

    @IsDefined({ message: "Şifrə boş ola bilməz!" })
    @MinLength(6, { message: "Şifrə ən az 6 simvol olmalıdır!" })
    password!: string;

    @IsDefined({ message: "Şifrə təsdiqi boş ola bilməz!" })
    @ValidateIf((o) => o.password === o.confirm_password)
    confirm_password!: string;

    @IsDefined({ message: "Telefon nömrəsi boş ola bilməz!" })
    @Matches(/(?:0|994)(?:12|51|50|55|70|77)[^\w]{0,2}[2-9][0-9]{2}[^\w]{0,2}[0-9]{2}[^\w]{0,2}[0-9]{2}/, { message: "Telefon nömrəsi düzgün formatda deyil!" })
    phone_number!: string;
}
export class LoginDto {
    @IsDefined({ message: "Email boş ola bilməz!" })
    @IsEmail({}, { message: "Düzgün email daxil edin!" })
    email!: string;

    @IsDefined({ message: "Şifrə boş ola bilməz!" })
    @MinLength(6, { message: "Şifrə ən az 6 simvol olmalıdır!" })
    password!: string;
}
