import { useInputControl } from '@conform-to/react'
import { Checkbox, type CheckboxProps } from '@epic-stack-monorepo/ui/checkbox'
import { Label } from '@epic-stack-monorepo/ui/label'
import { useId, useRef } from 'react'
import { FormErrors, type FormErrorsType } from './form-errors.tsx'

export type FormControlCheckboxProps = {
	label?: string
	buttonProps: CheckboxProps & {
		name: string
		form: string
		value?: string
	}
	errors?: FormErrorsType
	className?: string
}

export function FormControlCheckbox({
	buttonProps,
	label,
	errors,
	className,
}: FormControlCheckboxProps) {
	const fallbackId = useId()
	const buttonRef = useRef<HTMLButtonElement>(null)

	const { key, defaultChecked, ...checkboxProps } = buttonProps

	const checkedValue = buttonProps.value ?? 'on'

	const input = useInputControl({
		key,
		name: buttonProps.name,
		formId: buttonProps.form,
		initialValue: defaultChecked ? checkedValue : undefined,
	})

	const id = buttonProps.id ?? fallbackId

	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div className={className}>
			<div className="flex gap-2">
				<Checkbox
					id={id}
					ref={buttonRef}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					checked={input.value === checkedValue}
					{...checkboxProps}
					onCheckedChange={state => {
						input.change(state.valueOf() ? checkedValue : '')
						buttonProps.onCheckedChange?.(state)
					}}
					onFocus={event => {
						input.focus()
						buttonProps.onFocus?.(event)
					}}
					onBlur={event => {
						input.blur()
						buttonProps.onBlur?.(event)
					}}
					type="button"
				/>
				<Label
					htmlFor={id}
					className="text-body-xs mb-0 self-center font-normal"
				>
					{label}
				</Label>
			</div>
			{errorId && <FormErrors id={errorId} errors={errors} />}
		</div>
	)
}
