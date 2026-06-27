'use client';

import { useEffect, useState } from 'react';
import { deleteLead, getLead } from '@/lib/api';
import type { ServiceRequest } from '@/lib/types';

export default function AdminLeadPage() {
  const [Lead, setLead] = useState<ServiceRequest[]>([]);//user
  const [status, setStatus] = useState('');

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function refreshUsers() {
    try {
      setLead(await getLead());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load users.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteLead(id);
      await refreshUsers();
      setStatus('Lead User deleted successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to delete user.');
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Lead USers</h1>
        <p className="muted">Delete users directly from the table.</p>
        {status ? <p className={status.includes('success') ? 'success' : 'error'}>{status}</p> : null}
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
              {Lead.map((Lead) => (
                <tr key={Lead.id}>
                  <td>{Lead.name}</td>
                  <td>{Lead.email}</td>
                  <td>{Lead.phone}</td>
                  {<td>{Lead.service}</td>}
                  {<td>{Lead.message}</td>}
                  <td>{new Date(Lead.createdAt).toLocaleString()}</td>
                  <td><button className="button-ghost" onClick={() => handleDelete(Lead.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
