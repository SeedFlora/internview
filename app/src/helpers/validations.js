import { z } from "zod";

// Base validation
const isString = () => z.string();
const isBoolean = () => z.boolean();

// Specific validations

const isEmail = () =>
    z.email("Invalid email address");

const isRequiredString = (minLength = 1, maxLength = 9999) =>
    z.string()
        .min(minLength, "Bidang ini harus diisi" )  
        .max(maxLength, `Bidang ini harus kurang dari ${maxLength} karakter`);

const isRequiredOptions = () =>
    isRequiredString()
    .or(
        z.boolean()
            .optional()
            .nullable()
            .refine((val) => val !== null && val !== undefined, 
                "Silahkan pilih opsi",
            )
    );

const isRequiredStringOptional = () =>
    z.string().optional()

const isRequiredPhoneNumber = () =>
    z.string()
        .min(8, "Bidang isi harus diisi")
        .regex(/^08[0-9]{6,15}$/,"Must Started with 08")

const isPassword = () =>
    z.string()
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[a-z]/, "Password must contain lowercase letter")
        .regex(/[0-9]/, "Password must contain number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain special character")
        .min(8, "Password must be at least 8 characters")

const isRequiredNumber = (min = 1, message = "Bidang isi harus diisi") =>
    z
        .number("Bidang isi harus diisi")
        .int("Angka tidak boelh desimal")
        .positive()
        .min(min, message);

const isOptionalBoolean = () => z.boolean().optional();

const isOptionalString = () => z.string().optional().nullable();

const isRequiredEmail = () =>
    z.email("Invalid email address");

const isRequiredDate = () =>
    z
        .date({
            errorMap: (issue, { defaultError }) => ({
                message:
                    issue.code === "invalid_union"
                        ? "Bidang ini harus diisi"
                        : defaultError,
            }),
        })
    .or(isRequiredString())

const isValidSearchQuery = (query) => {
    return query && query.trim().length > 3;
};

export {
    isString,
    isBoolean,
    isEmail,
    isRequiredString,
    isPassword,
    isOptionalBoolean,
    isOptionalString,
    isRequiredEmail,
    isRequiredNumber,
    isRequiredOptions,
    isRequiredPhoneNumber,
    isRequiredDate,
    isRequiredStringOptional,
    isValidSearchQuery
};