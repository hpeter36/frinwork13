'use client'

import React from 'react'
import { LoginForm } from '@/components'
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

async function LoginPage() {

	const router = useRouter();
	const { data: session, status } = useSession();

	// go to home page if logged in
	if(session)
        router.push('/')

  return (
	<div className="flex justify-center items-center w-full">
		<LoginForm />
	</div>
  )
}

export default LoginPage