import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { logout } from '#app/utils/server/auth.server.ts'

export async function loader() {
	return redirect('/')
}

export async function action({ request }: ActionFunctionArgs) {
	return logout({ request })
}
