import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden py-12">
      {/* Blurred overlay background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-4 md:mx-0 px-4">
        <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
          {/* Left side - Image */}
          <div className="md:w-1/2 relative h-56 md:h-auto">
            <img 
              src="/images/login.jpg" 
              alt="illustration" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20"></div>
          </div>

          {/* Right side - Form */}
          <div className="md:w-1/2 p-10 md:p-12 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-inner">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">Welcome back</h1>
              <p className="text-base text-neutral-500 mt-2">Sign in or create an account to continue.</p>
            </div>
            
            <Outlet />
            
            <div className="mt-8 pt-8 border-t border-white/40 text-sm text-neutral-600 flex justify-center gap-4">
              <Link to="/auth/login" className="hover:text-neutral-900 transition-all duration-300 font-medium hover:scale-105">Login</Link>
              <span className="text-neutral-300">·</span>
              <Link to="/auth/signup" className="hover:text-neutral-900 transition-all duration-300 font-medium hover:scale-105">Sign up</Link>
              <span className="text-neutral-300">·</span>
              <Link to="/auth/forgot" className="hover:text-neutral-900 transition-all duration-300 font-medium hover:scale-105">Forgot</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}