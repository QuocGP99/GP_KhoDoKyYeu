import {z} from "zod";

export const createUserSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["ADMIN", "STAFF"]),
    isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
    fullName: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    username: z.string().trim().min(3).optional(),
    password: z.string().trim().min(6).optional(),
    role: z.enum(["ADMIN", "STAFF"]).optional(),
    isActive: z.boolean().optional(),
});

export const updateUserStatusSchema = z.object({
    isActive: z.boolean(),
});