import React, { useState } from 'react'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [userType, setUserType] = useState('individual') // Add this line
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiUrl = import.meta.env.VITE_API_URL || ''

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    if(password !== confirm){ setError('Passwords do not match'); return }
    setLoading(true)
    try{
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType }) // Include userType in the request
      })
      if(!res.ok) throw new Error('Signup failed')
      const data = await res.json()
      console.log('signup success', data)
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Full name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required placeholder="Jane Doe" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@company.com" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">User type</label>
        <select value={userType} onChange={e=>setUserType(e.target.value)} className="mt-2 block w-full p-3 border border-neutral-200 rounded-md">
          <option value="individual">Individual</option>
          <option value="organization">Organization</option>
          <option value="business">Business</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="Create a password" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Confirm password</label>
        <input value={confirm} onChange={e=>setConfirm(e.target.value)} required type="password" placeholder="Repeat your password" className="mt-2 block w-full p-3 border border-neutral-200 rounded-md" />
      </div>
      <div className="flex items-center justify-end">
        <button className="btn-black" disabled={loading}>{loading? 'Creating...' : 'Create account'}</button>
      </div>
    </form>
  )
}
