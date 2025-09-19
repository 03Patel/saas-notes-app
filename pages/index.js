import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tenantPlan, setTenantPlan] = useState("FREE");
  const [tenantSlug, setTenantSlug] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Update Note
  const updateNote = async () => {
    const res = await fetch(`${API_URL}/notes/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes(notes.map((n) => (n.id === editingId ? data : n)));
      setEditingId(null);
      setTitle("");
      setContent("");
    } else {
      alert(data.error);
    }
  };

  // Login
  const login = async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setTenantPlan(data.user.tenant.plan);
      setTenantSlug(data.user.tenant.slug);
      setUserRole(data.user.role);
      setUserEmail(data.user.email);
      setTenantName(data.user.tenant.name);
      fetchNotes(data.token);
    } else {
      alert(data.error);
    }
  };

  // Fetch notes
  const fetchNotes = async (authToken) => {
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    setNotes(data);
  };

  // Create note
  const createNote = async () => {
    if (tenantPlan === "FREE" && notes.length >= 3) {
      alert(
        userRole === "ADMIN"
          ? "Free plan limit reached. Upgrade to Pro."
          : "Free plan limit reached. Contact your Admin to upgrade."
      );
      return;
    }
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setNotes([...notes, data]);
      setTitle("");
      setContent("");
    } else {
      alert(data.error);
    }
  };

  // Delete note
  const deleteNote = async (id) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      setNotes(notes.filter((n) => n.id !== id));
    } else {
      alert(data.error || "Failed to delete");
    }
  };

  // Upgrade tenant (Admin only)
  const upgradeTenant = async () => {
    const res = await fetch(`${API_URL}/tenants/${tenantSlug}/upgrade`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setTenantPlan("PRO");
    } else {
      alert(data.error);
    }
  };

  // Logout
  const logout = () => {
    setToken("");
    setNotes([]);
    setTitle("");
    setContent("");
    setTenantPlan("FREE");
    setTenantSlug("");
    setUserRole("");
    setUserEmail("");
    setTenantName("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      {token && (
        <nav className="bg-blue-700 text-white p-4 flex flex-col sm:flex-row justify-between items-center shadow-md">
          <div className="mb-2 sm:mb-0">
            <span className="font-extrabold text-lg mr-3">{tenantName}</span>
            <span className="text-sm font-medium bg-blue-800 px-2 py-1 rounded">
              {tenantPlan} Plan
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm sm:text-base">
            <span className="truncate max-w-xs sm:max-w-md">
              {userEmail} <span className="font-semibold">({userRole})</span>
            </span>
            <button
              className="bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 px-4 py-2 rounded transition"
              onClick={logout}
              aria-label="Logout"
              type="button"
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      <main className="flex flex-col items-center p-6 max-w-4xl mx-auto w-full">
        {!token ? (
          <section className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
              Login
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
              className="space-y-5"
            >
              <input
                type="email"
                className="w-full text-black p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="username"
              />
              <input
                type="password"
                className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-white py-3 rounded-md font-semibold transition"
              >
                Login
              </button>
            </form>
          </section>
        ) : (
          <section className="w-full max-w-3xl">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Notes</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingId) {
                  updateNote();
                } else {
                  createNote();
                }
              }}
              className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4"
            >
              <input
                type="text"
                className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 text-white py-3 px-6 rounded-md font-semibold transition"
              >
                {editingId ? "Update Note" : "Add Note"}
              </button>
            </form>

            {/* Upgrade button only for Admins when Free limit reached */}
            {tenantPlan === "FREE" &&
              notes.length >= 3 &&
              userRole === "ADMIN" && (
                <div className="mb-6 text-center">
                  <button
                    onClick={upgradeTenant}
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 text-white py-3 px-6 rounded-md font-semibold transition"
                    type="button"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}

            {/* Notes List */}
            <ul className="space-y-5">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="bg-white text-black p-5 rounded-lg shadow space-y-3"
                >
                  <h3 className="text-xl  font-semibold">{n.title}</h3>
                  <p>{n.content}</p>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setTitle(n.title);
                        setContent(n.content);
                        setEditingId(n.id);
                      }}
                      className="bg-yellow-500 text-white px-3 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
