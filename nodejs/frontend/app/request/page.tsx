'use client';

import { FormEvent, useState } from 'react';
import { submitRequest } from '@/lib/api';

const initialForm = { name: '', email: '', phone: '', service: 'Consulting', message: '' };

export default function RequestPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      await submitRequest(form);
      setStatus('Request submitted successfully.');
      setForm(initialForm);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to submit request.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Service request</h1>
        <p className="muted">Capture lead data and hand it to the backend API.</p>
        <form className="form" onSubmit={handleSubmit}>
          {[['name', 'Name'], ['email', 'Email'], ['phone', 'Phone']].map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input id={key} required value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </div>
          ))}
          <div className="field">
            <label htmlFor="service">Service</label>
            <select id="service" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              <option>Consulting</option>
              <option>Support</option>
              <option>Implementation</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </div>
          <button className="button" disabled={isLoading} type="submit">{isLoading ? 'Submitting...' : 'Submit request'}</button>
        </form>
        {status ? <p className={status.includes('success') ? 'success' : 'error'}>{status}</p> : null}
      </section>
    </main>
  );
}
