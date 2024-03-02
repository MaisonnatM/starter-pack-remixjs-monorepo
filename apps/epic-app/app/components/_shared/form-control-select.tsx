import { Label } from '@epic-stack-monorepo/ui/label'
import {
	Select,
	SelectTrigger,
	SelectValue,
	type SelectProps,
	SelectContent,
	SelectGroup,
	SelectItem,
} from '@epic-stack-monorepo/ui/select'
import { useId, useState } from 'react'
import { FormErrors, type FormErrorsType } from './form-errors.tsx'

type FormControlSelectProps = {
	label: string
	selectProps: SelectProps
	errors?: FormErrorsType
	options?: {
		value: string
		label: string
	}[]
	placeholder?: string
}

export function FormControlSelect({
	label,
	selectProps,
	errors,
	placeholder = 'Select an option',
	options = [],
}: FormControlSelectProps) {
	const [value, setValue] = useState<string | undefined>(
		selectProps.defaultValue,
	)

	const fallbackId = useId()

	const id = selectProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined

	return (
		<div>
			<Label htmlFor={id}>
				{label}
				{selectProps.required && (
					<span className="text-destructive text-sm font-normal"> *</span>
				)}
			</Label>
			<Select
				name={selectProps.name}
				defaultValue={selectProps.defaultValue}
				onValueChange={setValue}
				value={value}
			>
				<SelectTrigger
					id={id}
					aria-invalid={errorId ? true : undefined}
					aria-describedby={errorId}
					value={value}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.map(({ value, label }) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{errorId && <FormErrors id={errorId} errors={errors} />}
		</div>
	)
}
