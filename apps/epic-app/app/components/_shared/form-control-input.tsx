import { Input, type InputProps } from '@epic-stack-monorepo/ui/input.tsx'
import { Label } from '@epic-stack-monorepo/ui/label'
import { useId } from 'react'
import { FormErrors, type FormErrorsType } from './form-errors.tsx'

type FormControlInputProps = {
	inputProps: InputProps
	label?: string
	errors?: FormErrorsType
}

export function FormControlInput({
	label,
	inputProps,
	errors,
}: FormControlInputProps) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div>
			{label && (
				<Label htmlFor={id}>
					{label}
					{inputProps.required && (
						<span className="text-destructive text-sm font-normal"> *</span>
					)}
				</Label>
			)}
			<Input
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			/>
			{errorId && <FormErrors id={errorId} errors={errors} />}
		</div>
	)
}
