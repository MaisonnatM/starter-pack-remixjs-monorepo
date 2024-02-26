import { type PropsWithChildren } from 'react'

export function MainLayout({ children }: PropsWithChildren) {
	return (
		<>
			<header>header</header>
			<main>{children}</main>
			<footer>footer</footer>
		</>
	)
}
