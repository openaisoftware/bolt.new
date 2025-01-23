import { useState } from 'react'
import { supabase } from '~/lib/supabase'

interface ForgotPasswordFormProps {
  onClose: () => void;
}

export function ForgotPasswordForm({ onClose }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="i-ph:check-circle-duotone text-4xl text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">Check your email</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-4">
          We've sent you a link to reset your password.
        </p>
        <button
          onClick={onClose}
          className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-semibold bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-bolt-elements-textSecondary">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {loading ? 'Sending...' : 'Reset Password'}
      </button>
    </form>
  )
} 