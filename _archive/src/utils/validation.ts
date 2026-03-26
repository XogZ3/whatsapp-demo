import { z } from 'zod';

const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export const validateSignInData = (email: string, password: string) => {
  const errors: { [key: string]: string } = {};
  try {
    emailSchema.parse(email);
  } catch (error) {
    errors.email = 'Invalid email format';
  }
  try {
    passwordSchema.parse(password);
  } catch (error) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};
