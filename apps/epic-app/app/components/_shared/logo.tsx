import { Link } from '@remix-run/react'
import { ROUTES } from '#app/utils/helpers/routes.tsx'

export function Logo() {
	return (
		<Link to={ROUTES.home} className="flex items-center space-x-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 256 256"
				className="h-6 w-6"
			>
				<rect width="256" height="256" fill="none"></rect>
				<line
					x1="208"
					y1="128"
					x2="128"
					y2="208"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="16"
				></line>
				<line
					x1="192"
					y1="40"
					x2="40"
					y2="192"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="16"
				></line>
			</svg>
			<span className="hidden font-bold sm:inline-block">shadcn/ui</span>
		</Link>
	)
}
