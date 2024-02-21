import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { z } from 'zod'
import { combineHeaders } from '../helpers/misc.tsx'

export const toastKey = 'toast'

const ToastSchema = z.object({
	variant: z.enum(['default', 'destructive']),
	title: z.string(),
	description: z.string(),
})

export type Toast = z.infer<typeof ToastSchema>

export const toastSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'en_toast',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

export async function redirectWithToast(
	url: string,
	toast: Toast,
	init?: ResponseInit,
) {
	return redirect(url, {
		...init,
		headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
	})
}

export async function createToastHeaders(optionalToast: Toast) {
	const session = await toastSessionStorage.getSession()
	const toast = ToastSchema.parse(optionalToast)

	session.flash(toastKey, toast)

	const cookie = await toastSessionStorage.commitSession(session)

	return new Headers({ 'set-cookie': cookie })
}

export async function getToast(request: Request) {
	const session = await toastSessionStorage.getSession(
		request.headers.get('cookie'),
	)

	const result = ToastSchema.safeParse(session.get(toastKey))
	const toast = result.success ? result.data : null

	return {
		toast,
		headers: toast
			? new Headers({
					'set-cookie': await toastSessionStorage.destroySession(session),
				})
			: null,
	}
}
