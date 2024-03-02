import { Label } from '@epic-stack-monorepo/ui/label.tsx'
import { Textarea } from '@epic-stack-monorepo/ui/textarea.tsx'
import { useId } from 'react'
import { FormErrors, type FormErrorsType } from './form-errors.tsx'

type FormControlTextareaProps = {
	label: string
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	errors?: FormErrorsType
}

export function FormControlTextarea({
	label,
	textareaProps,
	errors,
}: FormControlTextareaProps) {
	const fallbackId = useId()
	const id = textareaProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div>
			<Label htmlFor={id}>
				{label}
				{textareaProps.required && (
					<span className="text-destructive text-sm font-normal"> *</span>
				)}
			</Label>
			<Textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			{errorId && <FormErrors id={errorId} errors={errors} />}
		</div>
	)
}
