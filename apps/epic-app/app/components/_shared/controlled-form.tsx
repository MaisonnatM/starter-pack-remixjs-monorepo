import { type FormMetadata } from '@conform-to/react'
import { cn } from '@epic-stack-monorepo/ui/index.ts'
import { useFetcher } from '@remix-run/react'
import { type PropsWithChildren } from 'react'
import { useIsPending } from '#app/hooks/useIsPending.ts'
import { FormErrors } from './form-errors.tsx'
import { StatusButton } from './status-button.tsx'

type ControlledFormProps = PropsWithChildren<
	Omit<HTMLFormElement, 'method'> & {
		errors: string[]
		form: FormMetadata
	}
>

export function ControlledForm({
	children,
	errors,
	form,
	...props
}: ControlledFormProps) {
	const fetcher = useFetcher()
	const isPending = useIsPending()

	return (
		<fetcher.Form
			{...props}
			method="POST"
			className={cn('flex flex-col gap-6', props.className)}
		>
			{children}
			<FormErrors errors={errors} />
			<div className="flex flex-row gap-2">
				<StatusButton
					className="w-full"
					status={isPending ? 'pending' : form.status ?? 'idle'}
					type="submit"
					disabled={isPending}
				>
					Save
				</StatusButton>
			</div>
		</fetcher.Form>
	)
}
