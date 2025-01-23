import { useState } from 'react'
import { supabase } from '~/lib/supabase'
import { useNavigate } from '@remix-run/react'
import { Dialog, DialogRoot, DialogTitle } from '~/components/ui/Dialog'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      // Navigate to home page after successful login
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-bolt-elements-textSecondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-bolt-elements-borderColor bg-transparent px-3 py-2 text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary focus:border-bolt-elements-borderColorActive focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-bolt-elements-textSecondary">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium text-bolt-elements-sidebar-buttonText hover:text-bolt-elements-sidebar-buttonText/80 transition-colors bg-transparent"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-bolt-elements-borderColor bg-transparent px-3 py-2 text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary focus:border-bolt-elements-borderColorActive focus:outline-none"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-semibold bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      {/* Forgot Password Modal */}
      <DialogRoot open={showForgotPassword}>
        <Dialog onBackdrop={() => setShowForgotPassword(false)} onClose={() => setShowForgotPassword(false)}>
          <div className="w-full max-w-md p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <DialogTitle>Reset Password</DialogTitle>
            </div>
            <ForgotPasswordForm onClose={() => setShowForgotPassword(false)} />
          </div>
        </Dialog>
      </DialogRoot>
    </>
  )
} 