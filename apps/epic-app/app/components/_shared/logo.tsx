import { Link } from '@remix-run/react'
import { ROUTES } from '#app/utils/helpers/routes.tsx'

export function Logo() {
	return (
		<Link to={ROUTES.home}>
			<img
				src="https://images.placeholders.dev/?width=35&height=35"
				alt="Epic Logo"
				className="light:block block dark:hidden"
			/>
			<img
				src="https://images.placeholders.dev/?width=35&height=35&bgColor=transparent&textColor=rgba(255,255,255,0.5)"
				alt="Epic Logo"
				className="light:hidden hidden dark:block"
			/>
		</Link>
	)
}
