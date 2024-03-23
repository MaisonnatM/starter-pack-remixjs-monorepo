import { z } from 'zod'

export const EmailSchema = z
	.string({ required_error: 'Email is required' })
	.email({ message: 'Email is invalid' })
	.min(3, { message: 'Email is too short' })
	.max(100, { message: 'Email is too long' })
	// users can type the email in any case, but we store it in lowercase
	.transform(value => value.toLowerCase())

export const PasswordSchema = z
	.string({ required_error: 'Password is required' })
	.min(6, { message: 'Password is too short' })
	.max(100, { message: 'Password is too long' })

export const PasswordAndConfirmPasswordSchema = z
	.object({ password: PasswordSchema, confirmPassword: PasswordSchema })
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ['confirmPassword'],
				code: 'custom',
				message: 'The passwords must match',
			})
		}
	})

const IMAGE_MAX_SIZE = 1024 * 1024 * 10 // 10MB

export const ImageSchema = z.object({
	image: z
		.instanceof(Blob)
		.optional()
		.refine(
			image => (image?.size || 0) <= IMAGE_MAX_SIZE,
			'Image size must be less than 10MB',
		),
	imageUrl: z.string().optional(),
})
