import { Button } from '@epic-stack-monorepo/ui/button.tsx'
import { Icon } from '@epic-stack-monorepo/ui/icon.tsx'
import { cn } from '@epic-stack-monorepo/ui/index.ts'
import { Input, type InputProps } from '@epic-stack-monorepo/ui/input.tsx'
import { forwardRef, useState } from 'react'

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false)

		return (
			<div className="relative">
				<Input
					type={showPassword ? 'text' : 'password'}
					className={cn('pr-10', className)}
					ref={ref}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					className="absolute right-0 top-0 mr-1 mt-1 h-7 w-7 p-2"
					onClick={() => setShowPassword(prev => !prev)}
				>
					{showPassword ? (
						<Icon name="eye-open" aria-hidden="true" />
					) : (
						<Icon name="eye-none" aria-hidden="true" />
					)}
					<span className="sr-only">
						{showPassword ? 'Hide password' : 'Show password'}
					</span>
				</Button>
			</div>
		)
	},
)

PasswordInput.displayName = 'PasswordInput'
