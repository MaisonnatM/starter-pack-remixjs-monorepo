import { Outlet } from '@remix-run/react'
import { MarketingLayout } from '#app/components/_layout/marketing.layout.tsx'

export default function Index() {
	return (
		<MarketingLayout>
			<Outlet />
		</MarketingLayout>
	)
}
