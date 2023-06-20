'use client'

import React from 'react'
import { LoginForm } from '@/components'
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

async function LoginPage() {

	const router = useRouter();
	const { data: session, status } = useSession();

	if(session)
        router.push('/')

  return (
	<div className='flex-center w-full'>
		<LoginForm />
	</div>
  )
}

export default LoginPage