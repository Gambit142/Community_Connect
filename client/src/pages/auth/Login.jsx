import React, { useState } from 'react'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiUrl = import.meta.env.VITE_API_URL || ''

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if(!res.ok) throw new Error('Login failed')
      const data = await res.json()
      console.log('login success', data)
    }catch(err){
      setError(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@company.com" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md focus:ring-2 focus:ring-black" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="Your password" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <button className="btn-black" disabled={loading}>{loading? 'Signing...' : 'Sign in'}</button>
        <a className="text-sm text-neutral-500 hover:underline" href="/auth/forgot">Forgot?</a>
      </div>
    </form>
  )
}
