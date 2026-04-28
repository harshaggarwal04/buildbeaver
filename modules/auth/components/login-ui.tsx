'use client'

import React, { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import Github from "../../../public/github-svg.svg"
import Image from 'next/image'


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
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black flex items-center justify-center px-4">

            {/* Card */}
            <div className="w-full max-w-md bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        🦫 BuildBeaver
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Review code. Build faster.
                    </p>
                </div>

                {/* Login Button */}
                <button
                    onClick={handleGithubLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-green-500 text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-60"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Signing in...</span>
                    ) : (
                        <>
                            <>
                                <Image src={Github} alt="GitHub" width={20} height={20} />
                                Continue with GitHub
                            </>
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-gray-500">secure login</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Footer */}
                <p className="text-xs text-center text-gray-500">
                    By continuing, you agree to BuildBeaver’s Terms & Privacy Policy
                </p>
            </div>
        </div>
    )
}

export default LoginUI