'use client';

import { FormEvent, useState } from 'react';
import { signUp } from '@/lib/api';

const initialForm = { name: '', email: '', phone: '', password: '' };

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      await signUp(form);
      setStatus('User registered successfully.');
      setForm(initialForm);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to register user.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Signup</h1>
        <form className="form" onSubmit={handleSubmit}>
          {[['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['password', 'Password']].map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input id={key} required type={key === 'password' ? 'password' : 'text'} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </div>
          ))}
          <button className="button" disabled={isLoading} type="submit">{isLoading ? 'Creating...' : 'Create account'}</button>
        </form>
        {status ? <p className={status.includes('success') ? 'success' : 'error'}>{status}</p> : null}
      </section>
    </main>
  );
}
