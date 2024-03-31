import { type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, json } from '@remix-run/react'
import { AppLayout } from '#app/components/_layout/app.layout.tsx'
import { requireUserId } from '#app/utils/server/auth.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	return json({})
}

export default function Layout() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	)
}
