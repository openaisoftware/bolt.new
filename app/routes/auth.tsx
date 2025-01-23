import { useState, useEffect } from 'react'
import { LoginForm } from '~/components/Auth/LoginForm'
import { SignupForm } from '~/components/Auth/SignupForm'
import { useAuth } from '~/components/AuthProvider'
import { json, redirect } from '@remix-run/cloudflare'
import { useNavigate } from '@remix-run/react'
import { getSession } from '~/utils/session.server'

export const loader = () => redirect('/')

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-8">
          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  )
} 