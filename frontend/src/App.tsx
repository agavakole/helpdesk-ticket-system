import { useEffect, useState } from "react";

/*
  Ticket type = what we receive from Flask (GET /api/tickets)
*/
type Ticket = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

/*
  Small pill component for status
*/
function StatusPill({ text }: { text: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-black/5";

  if (text === "Resolved") {
    return (
      <span className={`${base} bg-emerald-100 text-emerald-800`}>{text}</span>
    );
  }
  if (text === "In Progress") {
    return <span className={`${base} bg-sky-100 text-sky-800`}>{text}</span>;
  }
  return <span className={`${base} bg-slate-100 text-slate-800`}>{text}</span>;
}

/*
  Small pill component for priority
*/
function PriorityPill({ text }: { text: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-black/5";

  if (text === "High") {
    return <span className={`${base} bg-rose-100 text-rose-800`}>{text}</span>;
  }
  if (text === "Medium") {
    return (
      <span className={`${base} bg-amber-100 text-amber-800`}>{text}</span>
    );
  }
  return <span className={`${base} bg-slate-100 text-slate-800`}>{text}</span>;
}

/*
  Reusable “glass” card wrapper to match modern UI look
*/
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/70 p-5 shadow-xl backdrop-blur-md ring-1 ring-black/5">
      {children}
    </div>
  );
}

export default function App() {
  // tickets list from backend
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // if backend fails, we show this
  const [error, setError] = useState("");

  // Load tickets once when page loads
  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch("/api/tickets");

        if (!res.ok) {
          setError("Failed to load tickets");
          return;
        }

        const data = (await res.json()) as Ticket[];
        setTickets(data);
      } catch {
        setError("Network error while loading tickets");
      }
    }

    loadTickets();
  }, []);

  return (
    // Soft gradient background (like Dribbble UI)
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-200 to-emerald-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Helpdesk
            </h1>
            <p className="text-slate-700">
              Ticketing System{" "}
              <span className="text-slate-500">(Flask + React)</span>
            </p>
          </div>

          {/* Hide these buttons on very small screens */}
          <div className="hidden sm:flex gap-2">
            <button className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-black/5 hover:bg-white">
              Documentation
            </button>
            <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              + New Ticket
            </button>
          </div>
        </div>

        {/* Responsive layout:
            - mobile: 1 column
            - tablet: 2 columns
            - desktop: 3 columns
        */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* LEFT: Ticket list */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">My tickets</h2>
              <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                + New
              </button>
            </div>

            <input
              placeholder="Search tickets…"
              className="mb-4 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />

            {/* Show error OR show tickets */}
            {error ? (
              <p className="text-sm text-rose-700">{error}</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-slate-600">No tickets yet.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    className="w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left transition hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          #{t.id} — {t.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                          {t.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <StatusPill text={t.status} />
                        <PriorityPill text={t.priority} />
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      {t.category} • {t.created_at}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button className="mt-5 w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-blue-700">
              Create New Ticket
            </button>
          </GlassCard>

          {/* MIDDLE: Help center */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Help Center</h2>
              <span className="text-slate-500">🔎</span>
            </div>

            <input
              placeholder="Search articles…"
              className="mb-4 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />

            <div className="space-y-3">
              {[
                {
                  title: "Getting started",
                  desc: "Learn how to create, track, and update tickets.",
                },
                {
                  title: "Troubleshooting Wi-Fi",
                  desc: "Common fixes for DNS, IP config, and router issues.",
                },
                {
                  title: "Password resets",
                  desc: "Steps to reset your account securely.",
                },
              ].map((a) => (
                <div
                  key={a.title}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-4 hover:bg-white"
                >
                  <p className="font-bold text-slate-900">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{a.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl bg-blue-600/10 p-5">
              <p className="font-bold text-slate-900">Need help?</p>
              <p className="mt-1 text-sm text-slate-700">
                Create a ticket and our IT team will respond.
              </p>
              <button className="mt-4 rounded-3xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                Create Ticket
              </button>
            </div>
          </GlassCard>

          {/* RIGHT: New ticket form (UI only for now) */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">New ticket</h2>
              <span className="text-slate-500">🎧</span>
            </div>

            <label className="text-sm font-semibold text-slate-800">
              Category
            </label>
            <select className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400">
              <option>Network</option>
              <option>Software</option>
              <option>Hardware</option>
              <option>Account</option>
            </select>

            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Subject
            </label>
            <input
              placeholder="E.g., Wi-Fi keeps disconnecting"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />

            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Describe your issue
            </label>
            <textarea
              placeholder="Include what you tried already, and any error messages."
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              rows={5}
            />

            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-700">
              Add screenshot / file (max 10MB)
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Mark as urgent
              </span>
              <input type="checkbox" className="h-5 w-5" />
            </div>

            <button className="mt-6 w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-blue-700">
              Submit Ticket
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
