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
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'

import { FormControlInput } from '#app/components/_shared/form-control-input.tsx'
import { StatusButton } from '#app/components/_shared/status-button.tsx'
import { useIsPending } from '#app/hooks/useIsPending.ts'
import { PasswordAndConfirmPasswordSchema } from '#app/utils/helpers/validations.ts'
import {
	requireAnonymous,
	sessionKey,
	signup,
} from '#app/utils/server/auth.server.ts'
import { checkHoneypot } from '#app/utils/server/honeypot.server.ts'
import { sessionStorage } from '#app/utils/server/session.server.ts'
import { redirectWithToast } from '#app/utils/server/toast.server.ts'
import { verifySessionStorage } from '#app/utils/server/verification.server.ts'
import { type VerifyFunctionArgs } from './verify.tsx'

const onboardingEmailSessionKey = 'onboardingEmail'

const SignupFormSchema = z
	.object({
		redirectTo: z.string().optional(),
	})
	.and(PasswordAndConfirmPasswordSchema)

async function requireOnboardingEmail(request: Request) {
	await requireAnonymous(request)

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)

	const email = verifySession.get(onboardingEmailSessionKey)

	if (typeof email !== 'string' || !email) {
		throw redirect('/signup')
	}

	return email
}
export async function loader({ request }: LoaderFunctionArgs) {
	await requireOnboardingEmail(request)

	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	const email = await requireOnboardingEmail(request)

	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: intent =>
			SignupFormSchema.transform(async data => {
				if (intent !== null) return { ...data, session: null }

				const session = await signup({ ...data, email })
				return { ...data, session }
			}),
		async: true,
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { session, redirectTo } = submission.value

	const authSession = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)

	authSession.set(sessionKey, session.id)

	const verifySession = await verifySessionStorage.getSession()

	const headers = new Headers()

	headers.append(
		'set-cookie',
		await sessionStorage.commitSession(authSession, {
			expires: undefined,
		}),
	)
	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	)

	return redirectWithToast(
		safeRedirect(redirectTo),
		{
			title: 'Welcome',
			description: 'Thanks for signing up!',
		},
		{ headers },
	)
}

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const verifySession = await verifySessionStorage.getSession()

	verifySession.set(onboardingEmailSessionKey, submission.value.target)

	return redirect('/onboarding', {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}

export const meta: MetaFunction = () => {
	return [{ title: 'Setup Epic App Account' }]
}

export default function SignupRoute() {
	const actionData = useActionData<typeof action>()

	const isPending = useIsPending()

	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'onboarding-form',
		constraint: getZodConstraint(SignupFormSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SignupFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" className="flex flex-col gap-4" {...getFormProps(form)}>
			<HoneypotInputs />
			<FormControlInput
				inputProps={{
					...getInputProps(fields.password, { type: 'password' }),
					autoComplete: 'new-password',
					placeholder: '•••••••••••••••',
				}}
			/>
			<FormControlInput
				inputProps={{
					...getInputProps(fields.confirmPassword, { type: 'password' }),
					autoComplete: 'new-password',
					placeholder: '•••••••••••••••',
				}}
			/>

			<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

			<StatusButton
				className="w-full"
				status={isPending ? 'pending' : form.status ?? 'idle'}
				type="submit"
				disabled={isPending}
			>
				Create an account
			</StatusButton>
		</Form>
	)
}
