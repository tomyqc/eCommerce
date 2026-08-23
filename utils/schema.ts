import { z } from "zod";
import { commonValidations } from "./validation";

// Registration schema with comprehensive validation
export const registrationSchema = z.object({
  name: z.string().min(1, "Name is required").max(120).trim(),
  email: commonValidations.email,
  phone: z.string().min(3, "Phone number is required").max(40, "Phone number is too long").trim(),
  password: commonValidations.password,
});

// Login schema (for future use)
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, "Password is required"),
});

// Generic validation schema (keeping existing for backward compatibility)
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email()
});

export default schema;