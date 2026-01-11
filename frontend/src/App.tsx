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
  - Dashboard with statistics
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

  // Track selected ticket for detail view
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Track current view (dashboard or tickets)
  const [currentView, setCurrentView] = useState<"dashboard" | "tickets">(
    "dashboard"
  );

  // Filter state
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
    sortOrder: "newest" as "newest" | "oldest",
  });

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

  // Update ticket status
  async function updateTicketStatus(ticketId: number, newStatus: string) {
    setIsUpdatingStatus(true);
    setError("");

    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setSuccessMessage("Status updated successfully!");
      await loadTickets();

      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // Clear all filters
  function clearFilters() {
    setFilters({
      status: "All",
      priority: "All",
      category: "All",
      sortOrder: "newest",
    });
    setSearchQuery("");
  }

  // Count active filters
  function getActiveFilterCount() {
    let count = 0;
    if (filters.status !== "All") count++;
    if (filters.priority !== "All") count++;
    if (filters.category !== "All") count++;
    if (searchQuery !== "") count++;
    return count;
  }

  // Calculate statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  // Enhanced filter logic with sorting
  const filteredTickets = tickets
    .filter((t) => {
      if (filters.status !== "All" && t.status !== filters.status) return false;
      if (filters.priority !== "All" && t.priority !== filters.priority)
        return false;
      if (filters.category !== "All" && t.category !== filters.category)
        return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDescription = t.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return filters.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

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
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition ${
                currentView === "dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView("tickets")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition ${
                currentView === "tickets"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
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
              {currentView === "dashboard" ? "Dashboard" : "Support Tickets"}
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
          <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
            ⚠ {error}
          </div>
        )}

        {/* ========== DASHBOARD VIEW ========== */}
        {currentView === "dashboard" && (
          <main className="flex-1 overflow-auto p-6">
            {/* Statistics Cards */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Tickets */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-100">
                    Total Tickets
                  </p>
                  <Ticket className="h-8 w-8 text-blue-100" />
                </div>
                <p className="text-4xl font-bold">{stats.total}</p>
                <p className="mt-2 text-sm text-blue-100">All time</p>
              </div>

              {/* Open Tickets */}
              <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Open</p>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900">
                  {stats.open}
                </p>
                <p className="mt-2 text-sm text-slate-500">Awaiting response</p>
              </div>

              {/* In Progress */}
              <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    In Progress
                  </p>
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Ticket className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900">
                  {stats.inProgress}
                </p>
                <p className="mt-2 text-sm text-slate-500">Being worked on</p>
              </div>

              {/* Resolved */}
              <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Resolved</p>
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <Ticket className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900">
                  {stats.resolved}
                </p>
                <p className="mt-2 text-sm text-slate-500">Completed</p>
              </div>
            </div>

            {/* Recent Tickets Section */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Tickets
                </h2>
                <button
                  onClick={() => setCurrentView("tickets")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="py-12 text-center">
                  <Ticket className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-slate-600">No tickets yet</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">
                            #{ticket.id} — {ticket.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                            {ticket.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>{ticket.created_at}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* ========== TICKETS VIEW ========== */}
        {currentView === "tickets" && (
          <>
            {/* Search Bar & Filters */}
            <div className="border-b bg-white px-6 py-4">
              <div className="flex flex-col gap-4">
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

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="cursor-pointer rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters({ ...filters, priority: e.target.value })
                    }
                    className="cursor-pointer rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="All">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="cursor-pointer rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="All">All Categories</option>
                    <option value="Network">Network</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Account">Account</option>
                  </select>

                  <select
                    value={filters.sortOrder}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sortOrder: e.target.value as "newest" | "oldest",
                      })
                    }
                    className="cursor-pointer rounded-xl border-0 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>

                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearFilters}
                      className="ml-auto flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-100"
                    >
                      <X className="h-4 w-4" />
                      Clear ({getActiveFilterCount()})
                    </button>
                  )}
                </div>
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
                          onClick={() => setSelectedTicket(ticket)}
                          className="cursor-pointer hover:bg-slate-50"
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
          </>
        )}
      </div>

      {/* ========== CREATE TICKET MODAL ========== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
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

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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

      {/* ========== TICKET DETAIL PANEL ========== */}
      {selectedTicket && (
        <>
          <div
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 z-50 bg-black/30"
          />

          <div className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:w-96">
            <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Ticket #{selectedTicket.id}
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Title
                </label>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedTicket.title}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Description
                </label>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Category
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedTicket.category}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Priority
                </label>
                <div className="mt-2">
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Current Status
                </label>
                <div className="mt-2">
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Update Status
                </label>
                <div className="mt-2 space-y-2">
                  {["Open", "In Progress", "Resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateTicketStatus(selectedTicket.id, status)
                      }
                      disabled={
                        selectedTicket.status === status || isUpdatingStatus
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selectedTicket.status === status
                          ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {isUpdatingStatus
                        ? "Updating..."
                        : selectedTicket.status === status
                        ? `✓ ${status}`
                        : `Mark as ${status}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Created
                </label>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedTicket.created_at}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
