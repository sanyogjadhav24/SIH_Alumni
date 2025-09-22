"use client";

import React, { useState } from 'react';

export default function AdminUploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!files || files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) form.append('documents', files[i]);

      const token = localStorage.getItem('token');
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      const res = await fetch(`${base}/api/users/admin/upload-dataset`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || JSON.stringify(json));
      setResult(json);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<any>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  async function handleCsvUpload(e: React.FormEvent) {
    e.preventDefault();
    setCsvError(null);
    setCsvResult(null);
    if (!csvFile) {
      setCsvError('Please select a CSV file');
      return;
    }
    setCsvLoading(true);
    try {
      const form = new FormData();
      form.append('csvFile', csvFile);
      const token = localStorage.getItem('token');
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      const res = await fetch(`${base}/api/users/admin/upload-csv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || JSON.stringify(json));
      setCsvResult(json);
    } catch (err: any) {
      setCsvError(err.message || String(err));
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Upload Dataset</h1>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setFiles(e.target.files)}
        />
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Uploading...' : 'Upload and Store Hashes'}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Upload CSV of Past Students</h2>
        <p className="text-sm text-gray-600">CSV must have header columns: name,institute,percentage (case-insensitive)</p>
        <form onSubmit={handleCsvUpload} className="mt-3">
          <input type="file" accept=".csv,.xls,.xlsx" onChange={(e)=> setCsvFile(e.target.files?.[0] || null)} />
          <div className="mt-3">
            <button className="px-3 py-2 bg-green-600 text-white rounded" disabled={csvLoading} type="submit">{csvLoading ? 'Uploading...' : 'Upload CSV'}</button>
          </div>
        </form>
        {csvError && <div className="mt-2 text-red-600">{csvError}</div>}
        {csvResult && <div className="mt-2"><pre className="whitespace-pre-wrap">{JSON.stringify(csvResult, null, 2)}</pre></div>}
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-4">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
