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
	redirect,
	useActionData,
	useSearchParams,
} from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'

import { AuthLayout } from '#app/components/_layout/auth.layout'
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
		<AuthLayout
			title="Welcome back!"
			description="Enter your email and password to log in to your account."
		>
			<Form method="POST" {...getFormProps(form)} className="grid gap-2">
				<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

				<HoneypotInputs />
				<FormControlInput
					inputProps={{
						...getInputProps(fields.email, { type: 'text' }),
						autoFocus: true,
						autoComplete: 'email',
						placeholder: 'name@example.com',
					}}
					errors={fields.email.errors}
				/>

				<FormControlInput
					inputProps={{
						...getInputProps(fields.password, {
							type: 'password',
						}),
						autoComplete: 'current-password',
						placeholder: '••••••••••••••••',
					}}
					errors={fields.password.errors}
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
		</AuthLayout>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Login to Epic Notes' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
