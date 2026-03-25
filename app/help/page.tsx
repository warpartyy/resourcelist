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
    {/* Header */}
<h1 className="text-2xl font-semibold mb-2">
  Get in touch
</h1>

<p className="text-sm text-gray-600 mb-4">
  You can ask for help finding resources, share feedback, or let us know what’s missing.
  We’re always looking to improve and better support the community.
</p>

    <p className="text-xs text-gray-500 mb-6">
      This isn’t automated — a real person will read your message.
    </p>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        required
        placeholder="Share what’s going on or what you’re looking for..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded p-3"
        rows={5}
      />

      <input
        type="email"
        placeholder="Email (optional, if you'd like a response)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded p-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="button button-primary"
      >
        {loading ? 'Sending...' : 'Send message'}
      </button>
    </form>
  </div>
);
}