import Link from 'next/link';

const modules = [
  { title: 'Service requests', description: 'Capture name, email, phone, and service details.', href: '/request' },
  { title: 'User onboarding', description: 'Provide signup and login pages backed by the API.', href: '/signup' },
  { title: 'User Login', description: 'login pages backed by the API.', href: '/login' },
  { title: 'Admin operations', description: 'List and delete users from the admin view.', href: '/admin/users' },
  { title: 'AdminLead operations', description: 'List and delete users from the admin view.', href: '/admin/lead' }
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="pill-row">
          <span className="pill">Next.js frontend</span>
          <span className="pill">TypeScript</span>
          <span className="pill">Stack-neutral API contract</span>
        </div>
        <div className="grid two">
          <div>
            <h1>Service platform starter for seven backend stacks.</h1>
            <p>
              This workspace keeps the user interface consistent while letting each backend stack
              implement the same operations independently.
            </p>
          </div>
          <div className="panel">
            <div className="meta-row">
              <span className="button-ghost">Request</span>
              <span className="button-ghost">Signup</span>
              <span className="button-ghost">Login</span>
              <span className="button-ghost">Delete users</span>
            </div>
            <p className="muted">Point NEXT_PUBLIC_API_BASE_URL at the stack you want to test.</p>
          </div>
        </div>
      </section>

      <section className="section grid three">
        {modules.map((module) => (
          <article className="card" key={module.title}>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <Link className="button-ghost" href={module.href}>Open</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
