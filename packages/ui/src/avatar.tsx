import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from './index.ts'

const avatarVariants = cva(
	'relative flex shrink-0 overflow-hidden rounded-full',
	{
		variants: {
			size: {
				small: 'h-8 w-8',
				default: 'h-10 w-10',
			},
		},
	},
)

export interface AvatarProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
		VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	AvatarProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(avatarVariants({ size: props.size, className }))}
		{...props}
	/>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn('aspect-square h-full w-full', className)}
		{...props}
	/>
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			'bg-muted flex h-full w-full items-center justify-center rounded-full',
			className,
		)}
		{...props}
	/>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
