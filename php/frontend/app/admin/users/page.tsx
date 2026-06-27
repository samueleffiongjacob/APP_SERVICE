'use client';

import { useEffect, useState } from 'react';
import { deleteUser, getUsers } from '@/lib/api';
import type { AppUser } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function refreshUsers() {
    try {
      setUsers(await getUsers());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load users.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      await refreshUsers();
      setStatus('User deleted successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to delete user.');
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Users Regular</h1>
        <p className="muted">Delete users directly from the table.</p>
        {status ? <p className={status.includes('success') ? 'success' : 'error'}>{status}</p> : null}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{new Date(user.created_at.replace(' ', 'T')).toLocaleString()}</td>
                  <td><button className="button-ghost" onClick={() => handleDelete(user.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
