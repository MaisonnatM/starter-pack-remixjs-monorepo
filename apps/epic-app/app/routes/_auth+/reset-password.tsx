import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { useIsPending } from '#app/hooks/useIsPending.ts'
import { PasswordAndConfirmPasswordSchema } from '#app/utils/helpers/validations.ts'
import {
	requireAnonymous,
	resetUserPassword,
} from '#app/utils/server/auth.server.ts'
import { prisma } from '#app/utils/server/db.server.ts'
import { verifySessionStorage } from '#app/utils/server/verification.server.ts'
import { type VerifyFunctionArgs } from './verify.tsx'
import { GeneralErrorBoundary } from '#app/components/_shared/general-error-boundary.tsx'

const resetPasswordUsernameSessionKey = 'resetPasswordUsername'

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const target = submission.value.target

	const user = await prisma.user.findFirst({
		where: { email: target },
		select: { email: true },
	})

	// we don't want to say the user is not found if the email is not found
	// because that would allow an attacker to check if an email is registered

	if (!user) {
		return json(
			{
				result: submission.reply({ fieldErrors: { code: ['Invalid code'] } }),
			},
			{
				status: 400,
			},
		)
	}

	const verifySession = await verifySessionStorage.getSession()

	verifySession.set(resetPasswordUsernameSessionKey, user.email)

	return redirect('/reset-password', {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}

const ResetPasswordSchema = PasswordAndConfirmPasswordSchema

async function requireResetPasswordUsername(request: Request) {
	await requireAnonymous(request)

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)

	const resetPasswordUsername = verifySession.get(
		resetPasswordUsernameSessionKey,
	)

	if (typeof resetPasswordUsername !== 'string' || !resetPasswordUsername) {
		throw redirect('/login')
	}

	return resetPasswordUsername
}

export async function loader({ request }: LoaderFunctionArgs) {
	const resetPasswordUsername = await requireResetPasswordUsername(request)

	return json({ resetPasswordUsername })
}

export async function action({ request }: ActionFunctionArgs) {
	const resetPasswordUsername = await requireResetPasswordUsername(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ResetPasswordSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { password } = submission.value

	await resetUserPassword({ email: resetPasswordUsername, password })

	const verifySession = await verifySessionStorage.getSession()
	return redirect('/login', {
		headers: {
			'set-cookie': await verifySessionStorage.destroySession(verifySession),
		},
	})
}

export const meta: MetaFunction = () => {
	return [{ title: 'Reset Password | system/ui' }]
}

export default function ResetPasswordPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'reset-password',
		constraint: getZodConstraint(ResetPasswordSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ResetPasswordSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input
				{...getInputProps(fields.password, { type: 'password' })}
				autoComplete="new-password"
				autoFocus
			/>
			<input
				{...getInputProps(fields.confirmPassword, { type: 'password' })}
				autoComplete="new-password"
			/>

			<button type="submit" disabled={isPending}>
				Reset password
			</button>
		</Form>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
