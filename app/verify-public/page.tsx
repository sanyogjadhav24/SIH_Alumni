// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation'

export default function PublicVerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [institute, setInstitute] = useState('');
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  async function connectWallet() {
    try {
      if (!(window).ethereum) throw new Error('No wallet provider found');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
    } catch (err) {
      setMessage(err.message || String(err));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage('Email required');
    if (!file) return setMessage('Please attach your document');

    setLoading(true);
    try {
      const form = new FormData();
      form.append('documentFile', file);
      form.append('email', email);
      if (wallet) form.append('walletAddress', wallet);
      if (name) form.append('name', name);
      if (institute) form.append('institute', institute);
      if (percentage) form.append('percentage', percentage);

      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      const res = await fetch(`${base}/api/users/public/verify-request`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      setResult(json);
      if (!res.ok) throw new Error(json.message || JSON.stringify(json));
      if (json.verified) {
        // Redirect to login so user can sign in now
        router.push('/auth/login')
      } else {
        setMessage('Document not found in admin dataset. Admins have been notified.');
      }
    } catch (err) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Public verification</h1>
      <p className="mb-4">If you are an alumni whose account is awaiting verification, attach your document and submit. You may optionally provide name, institute and percentage to improve extraction accuracy.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full border p-2" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} />
        </div>
        <div>
          <button type="button" onClick={connectWallet} className="px-4 py-2 bg-green-600 text-white rounded mr-2">{wallet ? `Connected: ${wallet}` : 'Connect Wallet'}</button>
          <span className="text-sm text-gray-500 ml-2">(optional but required for automatic SBT mint)</span>
        </div>
        <div>
          <label className="block text-sm">Document</label>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={async (e)=>{
            const f = e.target.files ? e.target.files[0] : null;
            setFile(f);
            if (!f) return;
            // immediately call extract-fields to prefill form
            try {
              const fd = new FormData();
              fd.append('marksheet', f);
              const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
              const r = await fetch(`${base}/api/users/extract-fields`, { method: 'POST', body: fd });
              const j = await r.json();
              if (j && j.extracted) {
                setName(j.extracted.name || '');
                setInstitute(j.extracted.institute || '');
                setPercentage(j.extracted.percentage || '');
                setResult(j);
                if (j.diagnostic && (!j.extracted.name && !j.extracted.institute && !j.extracted.percentage)) {
                  setMessage(j.message || 'Could not extract fields. See diagnostics below.');
                }
              }
            } catch (err) {
              console.error('Auto-extract failed', err);
            }
          }} />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div>
            <label className="block text-sm">Name (optional)</label>
            <input className="w-full border p-2" type="text" value={name} onChange={(e)=> setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Institute (optional)</label>
            <input className="w-full border p-2" type="text" value={institute} onChange={(e)=> setInstitute(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Percentage (optional)</label>
            <input className="w-full border p-2" type="text" value={percentage} onChange={(e)=> setPercentage(e.target.value)} />
          </div>
        </div>

        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit for verification'}</button>
        </div>
      </form>

      {message && <div className="mt-4 text-sm text-red-600">{message}</div>}

      {result && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold">Verification result</h3>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          {result.diagnostic && (
            <div className="mt-3 text-sm text-gray-700">
              <strong>Diagnostics:</strong>
              <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(result.diagnostic, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
