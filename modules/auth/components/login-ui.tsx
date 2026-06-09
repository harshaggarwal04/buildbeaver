'use client'

import React, { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import Image from 'next/image'

import GitHub from '@/public/githubLogo.svg'
import BuildBeaverFaviconLogo from '@/public/favicon-logo.png'

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGithubLogin = async () => {
    setIsLoading(true)

    try {
      await signIn.social({
        provider: 'github',
      })
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Left Side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#020617] to-black" />

        {/* Glow Effects */}
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 max-w-3xl">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            🚀 AI-Powered Code Reviews
          </div>

          <div className="flex items-center gap-5 mb-10">
            <Image
              src={BuildBeaverFaviconLogo}
              alt="BuildBeaver"
              width={90}
              height={90}
              priority
            />

            <div>
              <h1 className="text-5xl font-bold text-white">
                BuildBeaver
              </h1>

              <p className="text-slate-400 text-lg">
                Review code. Build faster.
              </p>
            </div>
          </div>

          <h2 className="text-5xl xl:text-6xl font-bold leading-tight text-white">
            Catch bugs before
            <span className="block text-blue-400">
              they reach production.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            BuildBeaver automatically reviews pull requests, detects
            potential issues, suggests improvements, and helps teams
            ship high-quality code with confidence.
          </p>

          <div className="mt-12 grid gap-5">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-green-400 text-lg">✓</span>
              Automated pull request reviews
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-green-400 text-lg">✓</span>
              Security & performance insights
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-green-400 text-lg">✓</span>
              GitHub integration in seconds
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-green-400 text-lg">✓</span>
              AI-generated code suggestions
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[500px] flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1120]/80 backdrop-blur-xl shadow-2xl p-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <Image
              src={BuildBeaverFaviconLogo}
              alt="BuildBeaver"
              width={48}
              height={48}
            />

            <div>
              <h1 className="text-2xl font-bold text-white">
                BuildBeaver
              </h1>

              <p className="text-xs text-slate-400">
                Review code. Build faster.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">
              Welcome back
            </h2>

            <p className="mt-2 text-slate-400">
              Sign in with GitHub to continue to BuildBeaver.
            </p>
          </div>

          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-medium text-black transition-all duration-200 hover:bg-slate-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <Image
                  src={GitHub}
                  alt="GitHub"
                  width={20}
                  height={20}
                />
                Continue with GitHub
              </>
            )}
          </button>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Secure Authentication
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            New here? Simply continue with GitHub and we'll create
            your account automatically.
          </p>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginUI