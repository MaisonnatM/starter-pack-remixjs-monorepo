import { type PropsWithChildren } from 'react'
import { Logo } from '../_shared/logo.tsx'
import { ThemeSwitcher } from '../_shared/theme-switcher.tsx'

export function MarketingLayout({ children }: PropsWithChildren) {
	return (
		<>
			<header className="border-b">
				<div className="container flex h-20 flex-row items-center justify-between gap-6">
					<Logo />
					<ThemeSwitcher />
				</div>
			</header>
			<main>{children}</main>
			<footer className="border-t">
				<p>footer</p>
			</footer>
		</>
	)
}
