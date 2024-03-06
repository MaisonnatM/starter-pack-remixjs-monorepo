import { getFormProps, useForm } from '@conform-to/react'
import { Icon } from '@epic-stack-monorepo/ui/icon.tsx'
import { useFetcher, useRouteLoaderData } from '@remix-run/react'
import { useOptimisticThemeMode } from '#app/hooks/useTheme.ts'
import { type loader } from '#app/root.tsx'
import { type action } from '#app/routes/api+/theme+/update.ts'

export function ThemeSwitcher() {
	const data = useRouteLoaderData<typeof loader>('root')
	const fetcher = useFetcher<typeof action>()

	const [form] = useForm({
		id: 'theme-switcher',
		lastResult: fetcher.data?.result,
	})

	const optimisticMode = useOptimisticThemeMode()

	const mode = optimisticMode ?? data?.requestInfo.userPrefs.theme ?? 'system'

	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'

	const modeLabel = {
		light: (
			<Icon name="sun">
				<span className="sr-only">Light</span>
			</Icon>
		),
		dark: (
			<Icon name="moon">
				<span className="sr-only">Dark</span>
			</Icon>
		),
		system: (
			<Icon name="laptop">
				<span className="sr-only">System</span>
			</Icon>
		),
	}

	return (
		<fetcher.Form
			method="POST"
			action="/api/theme/update"
			{...getFormProps(form)}
		>
			<input type="hidden" name="theme" value={nextMode} />
			<div className="flex gap-2">
				<button
					type="submit"
					className="flex h-8 w-8 cursor-pointer items-center justify-center"
				>
					{modeLabel[mode]}
				</button>
			</div>
		</fetcher.Form>
	)
}
