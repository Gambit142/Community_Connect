import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-5xl mx-4 md:mx-0 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 relative h-56 md:h-auto">
          {/* Full-cover image with slight dark overlay */}
          <img src="/images/login.jpg" alt="illustration" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0"></div>
        </div>
        <div className="md:w-1/2 p-10 bg-white">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in or create an account to continue.</p>
          </div>
          <Outlet />
          <div className="mt-8 text-sm text-neutral-500 flex justify-center gap-4">
            <Link to="/auth/login" className="hover:underline">Login</Link>
            <span>·</span>
            <Link to="/auth/signup" className="hover:underline">Sign up</Link>
            <span>·</span>
            <Link to="/auth/forgot" className="hover:underline">Forgot</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
