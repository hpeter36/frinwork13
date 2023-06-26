import React from 'react'

import { PricingChart } from '@/components'

const PricingChartPage = () => {

  // If no session exists, display access denied message
  //if (!session) { return  <Layout><AccessDenied/></Layout> } másik példa

  return (
	<div  className="min-h-screen">
		<PricingChart />
	</div>
  )
}

export default PricingChartPage