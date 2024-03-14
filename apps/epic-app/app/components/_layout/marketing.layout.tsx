import { Avatar, AvatarImage } from '@epic-stack-monorepo/ui/avatar'
import { cn } from '@epic-stack-monorepo/ui/index'
import { Input } from '@epic-stack-monorepo/ui/input.tsx'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@epic-stack-monorepo/ui/navigation-menu'
import { Link, useLocation } from '@remix-run/react'
import { type PropsWithChildren } from 'react'
import { Logo } from '../_shared/logo.tsx'
import { ThemeSwitcher } from '../_shared/theme-switcher.tsx'

const ITEMS = [
	{ label: 'Home', href: '/' },
	{ label: 'Item 1', href: '/item-1' },
	{ label: 'Item 2', href: '/item-2' },
]

export function MarketingLayout({ children }: PropsWithChildren) {
	const { pathname } = useLocation()

	return (
		<>
			<header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
				<div className="container flex h-16 max-w-screen-2xl items-center">
					<div className="flex flex-row gap-6">
						<Logo />
						<NavigationMenu>
							<NavigationMenuList>
								{ITEMS.map(item => (
									<NavigationMenuItem key={item.href}>
										<NavigationMenuLink active={pathname === item.href} asChild>
											<Link
												className={cn(
													'hover:text-foreground/80 text-foreground/60 transition-colors',
													pathname === item.href && 'text-foreground',
												)}
												to={item.href}
											>
												{item.label}
											</Link>
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<div className="flex flex-1 items-center justify-between gap-6 md:justify-end">
						<Input placeholder="Search..." className="max-w-[300px]" />
						<Avatar size="small">
							<AvatarImage src="https://github.com/shadcn.png" alt="user" />
						</Avatar>
					</div>
				</div>
			</header>
			<main className="min-h-[80vh]">{children}</main>
			<footer className="border-border/40 container flex h-24 max-w-screen-2xl flex-row items-center justify-between gap-4 border-t">
				<p className="text-muted-foreground text-balance text-sm leading-loose md:text-left">
					Built by Maxence. The source code is available on GitHub.
				</p>
				<ThemeSwitcher />
			</footer>
		</>
	)
}
