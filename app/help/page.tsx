'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch('/api/resource-requests', {
      method: 'POST',
      body: JSON.stringify({
        message,
        contact_email: email,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
      setMessage('');
      setEmail('');
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">
          Thanks — we’ll help you find something
        </h1>
        <p className="text-sm text-gray-600">
          Someone from our team will review your request.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">
        Need help finding a resource?
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          required
          placeholder="Tell us what you’re looking for..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded p-3"
          rows={5}
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}