import { z } from 'zod';
import { ROLE_CATEGORIES } from '@/constants/roles';
import { isHoustonZip } from '@/constants/houston-zips';

/**
 * Step 1: Role selection validation
 */
export const roleSchema = z.object({
  role: z.enum(
    [
      ROLE_CATEGORIES[0].key,
      ROLE_CATEGORIES[1].key,
      ROLE_CATEGORIES[2].key,
      ROLE_CATEGORIES[3].key,
      ROLE_CATEGORIES[4].key,
    ],
    {
      message: 'Please select a role',
    }
  ),
});

/**
 * Step 2: Name validation
 */
export const nameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .refine((val) => val === val.trim(), {
      message: 'First name cannot have leading or trailing whitespace',
    }),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .refine((val) => val === val.trim(), {
      message: 'Last name cannot have leading or trailing whitespace',
    }),
});

/**
 * Step 3: Location validation
 * Validates zip code format and Houston metro area restriction
 */
export const locationSchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{5}$/, 'Please enter a valid 5-digit zip code')
    .refine((zip) => isHoustonZip(zip), {
      message: 'MVR is launching in Houston first',
    }),
});

/**
 * Step 4: Bio validation
 */
export const bioSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(1, 'Bio is required')
    .max(300, 'Bio must be less than 300 characters'),
});
