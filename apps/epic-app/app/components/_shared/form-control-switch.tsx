import { useInputControl } from '@conform-to/react'
import { Label } from '@epic-stack-monorepo/ui/label.tsx'
import { Switch, type SwitchProps } from '@epic-stack-monorepo/ui/switch.tsx'
import { useId } from 'react'
import { FormErrors, type FormErrorsType } from './form-errors.tsx'

type FormControlSwitchProps = {
	label: string
	switchProps: SwitchProps & {
		name: string
		form: string
		value?: string
	}
	errors?: FormErrorsType
	className?: string
}

export function FormControlSwitch({
	label,
	switchProps,
	errors,
}: FormControlSwitchProps) {
	const fallbackId = useId()

	const { key, defaultChecked, ...checkboxProps } = switchProps

	const checkedValue = switchProps.value ?? 'on'

	const input = useInputControl({
		key,
		name: switchProps.name,
		formId: switchProps.form,
		initialValue: defaultChecked ? checkedValue : undefined,
	})

	const id = switchProps.id ?? fallbackId

	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div>
			<div className="flew-row flex items-center gap-2">
				<Switch
					{...checkboxProps}
					id={id}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					checked={input.value === checkedValue}
					onCheckedChange={state => {
						input.change(state.valueOf() ? checkedValue : '')
						switchProps.onCheckedChange?.(state)
					}}
					onFocus={event => {
						input.focus()
						switchProps.onFocus?.(event)
					}}
					onBlur={event => {
						input.blur()
						switchProps.onBlur?.(event)
					}}
					type="button"
					defaultChecked={Boolean(switchProps.defaultValue)}
				/>
				<Label htmlFor={id}>{label}</Label>
			</div>
			{errorId && <FormErrors id={errorId} errors={errors} />}
		</div>
	)
}
