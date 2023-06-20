import React from 'react'

import { PricingChart } from '@/components'

const PricingChartPage = () => {

  // If no session exists, display access denied message
  //if (!session) { return  <Layout><AccessDenied/></Layout> } másik példa

  return (
	<div className='flex min-h-screen flex-col items-center justify-between p-24'>
		<PricingChart />
	</div>
  )
}

export default PricingChartPage