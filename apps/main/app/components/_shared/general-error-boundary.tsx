import { Button } from '@epic-stack-monorepo/ui/button'
import { Link, isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ROUTES } from '#app/utils/helpers/routes.tsx'

export function GeneralErrorBoundary() {
	const error = useRouteError()

	if (!error || !isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>404 error</h1>
				<p>Page not found</p>
				<Button variant="link" asChild>
					<Link to={ROUTES.home}>Back home</Link>
				</Button>
			</div>
		)
	}

	if (typeof document !== 'undefined') {
		console.error(error)
	}

	return (
		<div>
			<h1>{error.status} error</h1>
			<p>code: {error.statusText}</p>
			<Button variant="link" asChild>
				<Link to={ROUTES.home}>Back home</Link>
			</Button>
		</div>
	)
}
