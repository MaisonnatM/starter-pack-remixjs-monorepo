export type FormErrorsType = Array<string | null | undefined> | null | undefined

export function FormErrors({
	id,
	errors,
}: {
	errors?: FormErrorsType
	id?: string
}) {
	const errorsToRender = errors?.filter(Boolean)

	if (!errorsToRender?.length) return null

	return (
		<ul id={id} className="mt-2 flex flex-col gap-1">
			{errorsToRender.map(e => (
				<li key={e} className="text-destructive text-[12px]">
					{e}
				</li>
			))}
		</ul>
	)
}
