import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Menu,
  X,
  Home,
  Ticket,
  Settings,
  HelpCircle,
} from "lucide-react";

/*
  ============================================
  PROFESSIONAL HELPDESK LAYOUT
  ============================================
  Based on real-world helpdesk applications like:
  - Zendesk
  - Freshdesk
  - Intercom
  
  Key features:
  - Sidebar navigation
  - Clean table view for tickets
  - Modal for creating new tickets
  - Responsive design
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

type TicketFormData = {
  title: string;
  description: string;
  category: string;
  priority: string;
};

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    Open: "bg-blue-100 text-blue-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Resolved: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-orange-100 text-orange-700",
    High: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[priority as keyof typeof styles]
      }`}
    >
      {priority}
    </span>
  );
}

export default function App() {
  // State management
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    category: "Network",
    priority: "Low",
  });

  // Load tickets from backend
  async function loadTickets() {
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = (await res.json()) as Ticket[];
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  // Handle form submission
  async function handleSubmit() {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create ticket");

      setSuccessMessage("Ticket created successfully!");
      setFormData({
        title: "",
        description: "",
        category: "Network",
        priority: "Low",
      });
      setIsModalOpen(false);
      await loadTickets();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter tickets based on search
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Helpdesk</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-blue-600 transition hover:bg-blue-100">
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-100">
              <Ticket className="h-5 w-5" />
              <span className="font-medium">All Tickets</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-100">
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium">Help Center</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-100">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* User profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                U
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">User Name</p>
                <p className="text-xs text-slate-500">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              Support Tickets
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </header>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 rounded-lg bg-emerald-50 p-4 text-emerald-800 border border-emerald-200">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-rose-50 p-4 text-rose-800 border border-rose-200">
            ⚠ {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="border-b bg-white px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Tickets Table */}
        <main className="flex-1 overflow-auto p-6">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Title
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600 md:table-cell">
                    Category
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600 sm:table-cell">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Status
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600 lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      {searchQuery ? "No tickets found" : "No tickets yet"}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-slate-900">
                            {ticket.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                            {ticket.description}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-slate-600 md:table-cell">
                        {ticket.category}
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-slate-600 lg:table-cell">
                        {ticket.created_at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ========== CREATE TICKET MODAL ========== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Create New Ticket
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Network</option>
                  <option>Software</option>
                  <option>Hardware</option>
                  <option>Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Brief description of the issue"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide detailed information about the issue"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority <span className="text-rose-600">*</span>
                </label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        formData.priority === p
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
    </div>
  );
}
