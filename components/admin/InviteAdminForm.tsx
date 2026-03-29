'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { getSupabase } from '@/lib/supabase';

export default function InviteAdminForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error('Please enter an email');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error('You must be logged in');
      }

      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Admin invite sent');
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-2">
        Admin Invites
      </h2>

      {/* Supporting text */}
      <p className="text-sm text-gray-600 mb-4">
        Invite additional admins to help keep the directory accurate,
        up to date, and responsive to community needs.
      </p>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">
            Admin Email
          </label>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="button button-primary"
          >
            {loading ? 'Sending Invite...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}