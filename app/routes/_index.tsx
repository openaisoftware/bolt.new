import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { ProtectedRoute } from '~/components/Auth/ProtectedRoute';
import { useAuth } from '~/components/AuthProvider';
import { useState } from 'react';
import { Dialog, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { LoginForm } from '~/components/Auth/LoginForm';
import { SignupForm } from '~/components/Auth/SignupForm';

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

export default function Index() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  if (user) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-full w-full">
          <Header />
          <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-bolt-elements-textPrimary sm:text-6xl">
            Where ideas begin
          </h1>
          <p className="mt-6 text-lg leading-8 text-bolt-elements-textSecondary">
            Bolt is your AI-powered coding companion. Get help with your existing projects or bring new ideas to life in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
              className="rounded-md bg-bolt-elements-sidebar-buttonBackgroundDefault px-4 py-2.5 text-sm font-semibold text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setShowAuthModal(true);
              }}
              className="rounded-md bg-bolt-elements-sidebar-buttonBackgroundDefault px-4 py-2.5 text-sm font-semibold text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="i-ph:code-bold text-3xl text-bolt-elements-textPrimary mb-4" />
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Code Generation</h3>
            <p className="mt-2 text-sm text-bolt-elements-textSecondary text-center">
              Generate code in any programming language with detailed explanations and best practices.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="i-ph:brain-bold text-3xl text-bolt-elements-textPrimary mb-4" />
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">AI Assistant</h3>
            <p className="mt-2 text-sm text-bolt-elements-textSecondary text-center">
              Get instant help with debugging, code reviews, and technical questions.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="i-ph:rocket-launch-bold text-3xl text-bolt-elements-textPrimary mb-4" />
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">Project Kickstart</h3>
            <p className="mt-2 text-sm text-bolt-elements-textSecondary text-center">
              Start new projects with boilerplate code and project structure in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <DialogRoot open={showAuthModal}>
        <Dialog onBackdrop={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)}>
          <div className="w-full max-w-md p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <DialogTitle>{isLogin ? 'Sign In' : 'Create Account'}</DialogTitle>
            </div>
            
            {isLogin ? <LoginForm /> : <SignupForm />}
            
            <div className="mt-4 text-center text-sm text-bolt-elements-textSecondary">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-bolt-elements-sidebar-buttonText hover:text-bolt-elements-sidebar-buttonText/80 transition-colors bg-transparent"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </Dialog>
      </DialogRoot>
    </div>
  );
}
