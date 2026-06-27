'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser, getUsers, getToken } from '@/lib/api';
import type { AppUser } from '@/lib/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Guard: redirect to login if no token
    if (!getToken()) {
      router.push('/login');
      return;
    }
    void refreshUsers();
  }, []);

  async function refreshUsers() {
    try {
      setUsers(await getUsers());
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to load users.';
      // Token expired or invalid — send back to login
      if (msg.includes('credentials') || msg.includes('401')) {
        router.push('/login');
        return;
      }
      setStatus(msg);
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
                  <td>
                    <button className="button-ghost" onClick={() => handleDelete(user.id)}>
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
