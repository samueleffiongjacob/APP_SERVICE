'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLead, getLead, getToken } from '@/lib/api';
import type { ServiceRequest } from '@/lib/types';

export default function AdminLeadPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ServiceRequest[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Guard: redirect to login if no token
    if (!getToken()) {
      router.push('/login');
      return;
    }
    void refreshLeads();
  }, []);

  async function refreshLeads() {
    try {
      setLeads(await getLead());
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to load leads.';
      if (msg.includes('credentials') || msg.includes('401')) {
        router.push('/login');
        return;
      }
      setStatus(msg);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteLead(id);
      await refreshLeads();
      setStatus('Lead deleted successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to delete lead.');
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Lead Users</h1>
        <p className="muted">Delete leads directly from the table.</p>
        {status ? (
          <p className={status.includes('success') ? 'success' : 'error'}>{status}</p>
        ) : null}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Message</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.service}</td>
                  <td>{lead.message}</td>
                  <td>{new Date(lead.created_at.replace(' ', 'T')).toLocaleString()}</td>
                  <td>
                    <button className="button-ghost" onClick={() => handleDelete(lead.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
