import React, { useState } from 'react'

export default function Forgot(){
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const apiUrl = import.meta.env.VITE_API_URL || ''

  async function handleSubmit(e){
    e.preventDefault()
    setMessage(null); setError(null)
    setLoading(true)
    try{
      const res = await fetch(`${apiUrl}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if(!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setMessage(data.message || 'If your email exists, you will receive a reset link')
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <div className="text-green-600 text-sm">{message}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@company.com" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div className="flex items-center justify-end">
        <button className="btn-black" disabled={loading}>{loading? 'Sending...' : 'Send reset link'}</button>
      </div>
    </form>
  )
}
