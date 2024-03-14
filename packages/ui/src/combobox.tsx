import { CommandInput, CommandEmpty, CommandGroup, CommandItem } from 'cmdk'
import { Check, ChevronsUpDown, Command } from 'lucide-react'
import * as React from 'react'
import { Button } from './button.tsx'
import { cn } from './index.ts'
import { Popover, PopoverTrigger, PopoverContent } from './popover.tsx'

type ComboboxProps = {
	placeholder?: string
	inputProps?: React.ComponentPropsWithoutRef<typeof CommandInput>
	emptyText?: string
	options: { label: string; value: string }[]
}

export function Combobox({
	placeholder = 'Select an option...',
	emptyText = 'No option found.',
	inputProps,
	options,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false)
	const [value, setValue] = React.useState('')

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{value
						? options.find(option => option.value === value)?.label
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput {...inputProps} />
					<CommandEmpty>{emptyText}</CommandEmpty>
					<CommandGroup>
						{options.map(option => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={currentValue => {
									setValue(currentValue === value ? '' : currentValue)
									setOpen(false)
								}}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === option.value ? 'opacity-100' : 'opacity-0',
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
