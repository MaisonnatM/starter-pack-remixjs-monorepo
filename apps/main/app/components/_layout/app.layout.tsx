import { type PropsWithChildren } from 'react'

export function AppLayout({ children }: PropsWithChildren) {
	return (
		<>
			<header>header</header>
			<main>{children}</main>
			<footer>footer</footer>
		</>
	)
}
