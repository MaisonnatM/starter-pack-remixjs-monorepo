import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { FormControlInput } from '#app/components/_shared/form-control-input.tsx'
import { FormErrors } from '#app/components/_shared/form-errors.tsx'
import { GeneralErrorBoundary } from '#app/components/_shared/general-error-boundary.tsx'
import { StatusButton } from '#app/components/_shared/status-button.tsx'
import { ROUTES } from '#app/utils/helpers/routes.tsx'
import { EmailSchema } from '#app/utils/helpers/validations.ts'
import { prisma } from '#app/utils/server/db.server.ts'
import { sendEmail } from '#app/utils/server/email.server.ts'
import { checkHoneypot } from '#app/utils/server/honeypot.server.ts'
import { prepareVerification } from './verify.tsx'

const ForgotPasswordSchema = z.object({
	email: EmailSchema,
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: ForgotPasswordSchema.superRefine(async (data, ctx) => {
			const user = await prisma.user.findFirst({
				where: {
					email: data.email,
				},
				select: { id: true },
			})
			if (!user) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'No user exists with this email',
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

	const user = await prisma.user.findFirstOrThrow({
		where: { email },
		select: { email: true },
	})

	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'reset-password',
		target: email,
	})

	const response = await sendEmail({
		to: user.email,
		subject: `Epic Notes Password Reset`,
		react: (
			<ForgotPasswordEmail onboardingUrl={verifyUrl.toString()} otp={otp} />
		),
	})

	if (response.status === 'success') {
		return redirect(redirectTo.toString())
	} else {
		return json(
			{ result: submission.reply({ formErrors: [response.error.message] }) },
			{ status: 500 },
		)
	}
}

function ForgotPasswordEmail({
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
					<E.Text>Epic Notes Password Reset</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Password Recovery for Epic Notes' }]
}

export default function ForgotPasswordRoute() {
	const forgotPassword = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'forgot-password-form',
		constraint: getZodConstraint(ForgotPasswordSchema),
		lastResult: forgotPassword.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ForgotPasswordSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container pb-32 pt-20">
			<div className="flex flex-col justify-center">
				<div className="text-center">
					<h1 className="text-h1">Forgot Password</h1>
					<p className="text-body-md text-muted-foreground mt-3">
						No worries, we'll send you reset instructions.
					</p>
				</div>
				<div className="mx-auto mt-16 min-w-full max-w-sm sm:min-w-[368px]">
					<forgotPassword.Form method="POST" {...getFormProps(form)}>
						<HoneypotInputs />
						<div>
							<FormControlInput
								label="Email"
								inputProps={{
									autoFocus: true,
									...getInputProps(fields.email, { type: 'text' }),
								}}
								errors={fields.email.errors}
							/>
						</div>
						<FormErrors errors={form.errors} id={form.errorId} />

						<div className="mt-6">
							<StatusButton
								className="w-full"
								status={
									forgotPassword.state === 'submitting'
										? 'pending'
										: form.status ?? 'idle'
								}
								type="submit"
								disabled={forgotPassword.state !== 'idle'}
							>
								Recover password
							</StatusButton>
						</div>
					</forgotPassword.Form>
					<Link
						to={ROUTES.login}
						className="text-body-sm mt-11 text-center font-bold"
					>
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
