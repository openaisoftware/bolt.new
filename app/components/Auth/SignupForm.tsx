import { useState } from 'react'
import { supabase } from '~/lib/supabase'
import { useNavigate } from '@remix-run/react'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      
      // Navigate to home page after successful signup
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4 w-full max-w-sm">
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
        <label htmlFor="password" className="block text-sm font-medium text-bolt-elements-textSecondary">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-bolt-elements-borderColor bg-transparent px-3 py-2 text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary focus:border-bolt-elements-borderColorActive focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-bolt-elements-textSecondary">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Loading...' : 'Sign Up'}
      </button>
    </form>
  )
} 