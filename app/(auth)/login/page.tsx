import LoginUI from '@/modules/auth/components/login-ui'
import { requireUnAuth } from '@/modules/auth/utils/auth-utils'
import { Suspense } from 'react'

async function AuthCheck() {
  await requireUnAuth()
  return null
}

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <AuthCheck />
      <LoginUI />
    </Suspense>
  )
}

export default LoginPage