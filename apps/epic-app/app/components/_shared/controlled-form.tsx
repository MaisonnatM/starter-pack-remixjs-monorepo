import { cn } from '@epic-stack-monorepo/ui/index.ts'
import { useFetcher } from '@remix-run/react'
import { type PropsWithChildren } from 'react'
import { FormErrors } from './form-errors.tsx'
import { StatusButton } from './status-button.tsx'

type ControlledFormProps = PropsWithChildren<
	Omit<HTMLFormElement, 'method'> & {
		errors: string[]
	}
>

export function ControlledForm({
	children,
	errors,
	...props
}: ControlledFormProps) {
	const fetcher = useFetcher()

	return (
		<fetcher.Form
			{...props}
			method="POST"
			className={cn('flex flex-col gap-6', props.className)}
		>
			{children}
			<FormErrors errors={errors} />
			<div className="flex flex-row gap-2">
				<StatusButton action={props.action} loading={fetcher.state !== 'idle'}>
					Save
				</StatusButton>
			</div>
		</fetcher.Form>
	)
}
