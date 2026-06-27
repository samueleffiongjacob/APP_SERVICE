'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logIn } from '@/lib/api';

const initialForm = { email: '', password: '' };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      await logIn(form); // saves token to localStorage automatically
      setStatus('Login succeeded. Redirecting...');
      setForm(initialForm);
      router.push('/admin/users'); // ← redirect to admin after login
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to log in.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Login</h1>
        <form className="form" onSubmit={handleSubmit}>
          {[['email', 'Email'], ['password', 'Password']].map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                required
                type={key === 'password' ? 'password' : 'text'}
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </div>
          ))}
          <button className="button" disabled={isLoading} type="submit">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {status ? (
          <p className={status.includes('succeeded') ? 'success' : 'error'}>{status}</p>
        ) : null}
      </section>
    </main>
  );
}
