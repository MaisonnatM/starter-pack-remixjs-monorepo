import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import {
	json,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { SignupEmail } from '#app/components/_email/signup.email.tsx'
import { AuthLayout } from '#app/components/_layout/auth.layout'
import { FormControlInput } from '#app/components/_shared/form-control-input.tsx'
import { GeneralErrorBoundary } from '#app/components/_shared/general-error-boundary.tsx'
import { StatusButton } from '#app/components/_shared/status-button.tsx'
import { useIsPending } from '#app/hooks/useIsPending.ts'
import { EmailSchema } from '#app/utils/helpers/validations.ts'
import { prisma } from '#app/utils/server/db.server.ts'
import { sendEmail } from '#app/utils/server/email.server.ts'
import { checkHoneypot } from '#app/utils/server/honeypot.server.ts'
import { prepareVerification } from './verify.tsx'

const SignupSchema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			})
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
				})
				return
			}
		}),
		async: true,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { email } = submission.value

	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'onboarding',
		target: email,
	})

	const response = await sendEmail({
		to: email,
		subject: `Welcome to epic app!`,
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
	})

	if (response.status === 'success') {
		return redirect(redirectTo.toString())
	} else {
		return json(
			{
				result: submission.reply({ formErrors: [response.error.message] }),
			},
			{
				status: 500,
			},
		)
	}
}

export const meta: MetaFunction = () => {
	return [{ title: 'Sign Up | Epic App' }]
}

export default function SignupRoute() {
	const actionData = useActionData<typeof action>()

	const isPending = useIsPending()

	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getZodConstraint(SignupSchema),
		lastResult: actionData?.result,
		defaultValue: { redirectTo },
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: SignupSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<AuthLayout
			title="Create an account"
			description="Enter your email below to create your account"
		>
			<Form
				method="POST"
				{...getFormProps(form)}
				className="flex min-w-[325px] flex-col gap-4"
			>
				<HoneypotInputs />
				<FormControlInput
					inputProps={{
						...getInputProps(fields.email, { type: 'email' }),
						autoComplete: 'email',
						placeholder: 'Enter your email',
					}}
				/>

				<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />
				<StatusButton
					className="w-full"
					status={isPending ? 'pending' : form.status ?? 'idle'}
					type="submit"
					disabled={isPending}
				>
					Sign In with Email
				</StatusButton>
			</Form>
		</AuthLayout>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
