import { parseWithZod } from '@conform-to/zod'
import { useFetchers } from '@remix-run/react'

import { ThemeFormSchema } from '#app/routes/api+/theme+/update.ts'
import { useHints } from '#app/utils/helpers/client-hints.tsx'
import { useRequestInfo } from '#app/utils/helpers/request-infos.ts'

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()

	const themeFetcher = fetchers.find(f => f.formAction === '/api/theme/update')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()

	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}

	return requestInfo.userPrefs.theme ?? hints.theme
}
