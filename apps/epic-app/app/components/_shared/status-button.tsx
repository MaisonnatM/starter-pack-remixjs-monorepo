import { Button, type ButtonProps } from '@epic-stack-monorepo/ui/button'
import { Icon } from '@epic-stack-monorepo/ui/icon.tsx'
import { useNavigation } from '@remix-run/react'
import { useMemo } from 'react'

type StatusButtonProps = {
	action?: string
	loading?: boolean
} & Omit<ButtonProps, 'type'>

export function StatusButton({
	children,
	action,
	loading,
	...props
}: StatusButtonProps) {
	const navigation = useNavigation()

	const isSubmittingForm = useMemo(() => {
		const submittingForm = navigation.formData?.get('_action')

		if (typeof submittingForm !== 'string' || !submittingForm) {
			return false
		}

		if (submittingForm === action) {
			return navigation.state === 'submitting' || navigation.state === 'loading'
		}

		if (!action) {
			return navigation.state === 'submitting' || navigation.state === 'loading'
		}

		return false
	}, [action, navigation.formData, navigation.state])

	return (
		<Button
			{...props}
			type="submit"
			disabled={loading || props.disabled || isSubmittingForm}
		>
			{children}
			{isSubmittingForm ||
				(loading && <Icon name="update" className="animate-spin" />)}
		</Button>
	)
}
