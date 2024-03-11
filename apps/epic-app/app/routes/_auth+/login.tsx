import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	redirect,
	useActionData,
	useSearchParams,
} from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'

import { FormControlInput } from '#app/components/_shared/form-control-input.tsx'
import { FormErrors } from '#app/components/_shared/form-errors.tsx'
import { GeneralErrorBoundary } from '#app/components/_shared/general-error-boundary.tsx'
import { StatusButton } from '#app/components/_shared/status-button.tsx'
import { useIsPending } from '#app/hooks/useIsPending.ts'
import { combineResponseInits } from '#app/utils/helpers/misc.tsx'
import { ROUTES } from '#app/utils/helpers/routes.tsx'
import { EmailSchema, PasswordSchema } from '#app/utils/helpers/validations.ts'
import {
	login,
	requireAnonymous,
	sessionKey,
} from '#app/utils/server/auth.server.ts'
import { checkHoneypot } from '#app/utils/server/honeypot.server.ts'
import { sessionStorage } from '#app/utils/server/session.server.ts'

const LoginFormSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
	redirectTo: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)

	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			LoginFormSchema.transform(async (data, ctx) => {
				if (intent !== null) return { ...data, session: null }

				const session = await login(data)
				if (!session) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid username or password',
					})
					return z.NEVER
				}

				return { ...data, session }
			}),
		async: true,
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return json(
			{ result: submission.reply({ hideFields: ['password'] }) },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { session, redirectTo = '/' } = submission.value

	const authSession = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)

	return redirect(
		safeRedirect(redirectTo),
		combineResponseInits({
			headers: {
				'set-cookie': await sessionStorage.commitSession(authSession, {
					expires: session.expirationDate,
				}),
			},
		}),
	)
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getZodConstraint(LoginFormSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome back!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>

				<div>
					<div className="mx-auto w-full max-w-md px-8">
						<Form method="POST" {...getFormProps(form)}>
							<HoneypotInputs />
							<FormControlInput
								label="Email"
								inputProps={{
									...getInputProps(fields.email, { type: 'text' }),
									autoFocus: true,
									autoComplete: 'email',
								}}
								errors={fields.email.errors}
							/>

							<FormControlInput
								label="Password"
								inputProps={{
									...getInputProps(fields.password, {
										type: 'password',
									}),
									autoComplete: 'current-password',
								}}
								errors={fields.password.errors}
							/>

							<div>
								<Link
									to={ROUTES.forgotPassword}
									className="text-body-xs font-semibold"
								>
									Forgot password?
								</Link>
							</div>

							<input
								{...getInputProps(fields.redirectTo, { type: 'hidden' })}
							/>
							<FormErrors errors={form.errors} id={form.errorId} />

							<div className="flex items-center justify-between gap-6 pt-3">
								<StatusButton
									className="w-full"
									status={isPending ? 'pending' : form.status ?? 'idle'}
									type="submit"
									disabled={isPending}
								>
									Log in
								</StatusButton>
							</div>
						</Form>

						<div className="flex items-center justify-center gap-2 pt-6">
							<span className="text-muted-foreground">New here?</span>
							<Link
								to={
									redirectTo
										? `/signup?${encodeURIComponent(redirectTo)}`
										: '/signup'
								}
							>
								Create an account
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Login to Epic Notes' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
