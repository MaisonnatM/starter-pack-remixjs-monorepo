import { Button } from '@epic-stack-monorepo/ui/button'
import { Link, useLocation } from '@remix-run/react'
import { type PropsWithChildren } from 'react'
import { ROUTES } from '#app/utils/helpers/routes'
import { Logo } from '../_shared/logo'

type AuthLayoutProps = {
	title: string
	description: string
}

export function AuthLayout({
	title,
	children,
	description,
}: PropsWithChildren<AuthLayoutProps>) {
	const { pathname } = useLocation()

	return (
		<div className="container relative grid h-[100vh] grid-cols-5 items-center justify-center md:grid lg:max-w-none lg:px-0">
			<Button
				variant="ghost"
				asChild
				className="absolute right-4 top-4 md:right-8 md:top-8"
			>
				<Link to={pathname === '/login' ? ROUTES.signUp : ROUTES.login}>
					{pathname === '/login' ? 'Create an account' : 'Login'}
				</Link>
			</Button>
			<div className="bg-muted relative col-span-2  hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<Logo />
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="flex flex-col gap-2">
						<p className="text-lg">
							“This library has saved me countless hours of work and helped me
							deliver stunning designs to my clients faster than ever before.”
						</p>
						<footer className="text-sm">
							<cite className="block font-medium">Sofia Davis</cite>
						</footer>
					</blockquote>
				</div>
			</div>
			<div className="col-span-5 lg:col-span-3 lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
						<p className="text-muted-foreground text-sm">{description}</p>
					</div>
					{children}
					<p className="text-muted-foreground px-8 text-center text-sm">
						By clicking continue, you agree to our{' '}
						<Button variant="link" size="link" asChild>
							<Link to={ROUTES.tos}>Terms of Service</Link>
						</Button>{' '}
						and{' '}
						<Button variant="link" size="link" asChild>
							<Link to={ROUTES.privacy}>Privacy Policy</Link>
						</Button>
						.
					</p>
				</div>
			</div>
		</div>
	)
}
