import { href as iconsHref } from '@epic-stack-monorepo/ui/icon'
import { useToast } from '@epic-stack-monorepo/ui/index.ts'
import { cssBundleHref } from '@remix-run/css-bundle'
import {
	json,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'

import { useEffect } from 'react'
import { GeneralErrorBoundary } from './components/_shared/general-error-boundary.tsx'
import fontStyleSheetUrl from './styles/font.css'
import tailwindStyleSheetUrl from './styles/tailwind.css'
import { ClientHintCheck, getHints } from './utils/helpers/client-hints.tsx'
import { combineHeaders, getDomainUrl } from './utils/helpers/misc.tsx'
import { useNonce } from './utils/providers/nonce.provider.ts'
import { getEnv } from './utils/server/env.server.ts'
import { makeTimings } from './utils/server/timing.server.ts'
import { getToast } from './utils/server/toast.server.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		{ rel: 'preload', href: tailwindStyleSheetUrl, as: 'style' },
		cssBundleHref ? { rel: 'preload', href: cssBundleHref, as: 'style' } : null,
		{ rel: 'preload', href: fontStyleSheetUrl, as: 'style' },
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'preload', href: fontStyleSheetUrl, as: 'style' },
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: data ? 'Epic Notes' : 'Error | Epic Notes' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')

	const { toast, headers: toastHeaders } = await getToast(request)

	return json(
		{
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {},
			},
			ENV: getEnv(),
			toast,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

function Document({
	children,
	nonce,
	env = {},
}: {
	children: React.ReactNode
	nonce: string
	env?: Record<string, string>
}) {
	return (
		<html lang="en">
			<head>
				<ClientHintCheck nonce={nonce || ''} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body>
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<LiveReload nonce={nonce} />
			</body>
		</html>
	)
}

export default function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()

	const { toast } = useToast()

	useEffect(() => {
		if (data.toast) {
			toast(data.toast)
		}
	}, [data.toast, toast])

	return (
		<Document nonce={nonce} env={data.ENV}>
			<Outlet />
		</Document>
	)
}

export function ErrorBoundary() {
	const nonce = useNonce()

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
