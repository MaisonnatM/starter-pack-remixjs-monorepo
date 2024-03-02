import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'

import {
	json,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/_shared/general-error-boundary.tsx'
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
		subject: `Welcome to system/ui!`,
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

export function SignupEmail({
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>Welcome to system/ui!</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Sign Up | system/ui' }]
}

export default function SignupRoute() {
	const actionData = useActionData<typeof action>()

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
		<Form method="POST" {...getFormProps(form)} className="flex flex-col gap-4">
			<HoneypotInputs />
			<input
				{...getInputProps(fields.email, { type: 'email' })}
				autoComplete="email"
				placeholder="Enter your email"
			/>

			<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

			<div className="flex items-center justify-between gap-6 pt-3">
				<button type="submit">Sign Up</button>
			</div>
		</Form>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
