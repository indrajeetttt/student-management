import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000/api";
const emptyStudent = { name: "", email: "", age: "", course: "" };

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("student_auth_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login/", { username, password });
      localStorage.setItem("student_auth_token", res.data.token);
      localStorage.setItem("student_auth_user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon">🎓</div>
        <h1>Student Management</h1>
        <p className="subtitle">Login to continue</p>

        <label>Username</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />

        <label>Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        {error && <p className="error">{error}</p>}

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>

        <div className="auth-info">
          <strong>Authentication demo</strong>
          <p>
            Django verifies your username and password and returns an
            authentication token. The token is then sent with every student API request.
          </p>
        </div>
      </form>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [authStatus, setAuthStatus] = useState("Checking...");

  const loadStudents = async () => {
    try {
      const res = await api.get("/students/");
      setStudents(res.data);
      setAuthStatus("Authenticated");
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        setMessage("Start the Django backend first.");
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me/");
        setAuthStatus(res.data.authenticated ? "Authenticated" : "Not authenticated");
      } catch {
        onLogout();
      }
    };

    checkAuth();
    loadStudents();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const data = { ...form, age: Number(form.age) };

      if (editingId) {
        await api.put(`/students/${editingId}/`, data);
        setMessage("Student updated successfully.");
      } else {
        await api.post("/students/", data);
        setMessage("Student added successfully.");
      }

      setForm(emptyStudent);
      setEditingId(null);
      loadStudents();
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        setMessage("Please check the form and Django API.");
      }
    }
  };

  const edit = (student) => {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      age: student.age,
      course: student.course,
    });
    setMessage("");
  };

  const remove = async (id) => {
    if (!confirm("Delete this student?")) return;

    try {
      await api.delete(`/students/${id}/`);
      setMessage("Student deleted.");
      loadStudents();
    } catch (err) {
      if (err.response?.status === 401) onLogout();
      else setMessage("Could not delete the student.");
    }
  };

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Student Management</h1>
          <p>Protected React + Django REST application</p>
        </div>

        <div className="user-box">
          <span className="auth-badge">● {authStatus}</span>
          <span>👤 {user.username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="auth-banner">
        <div>
          <strong>Authentication is active</strong>
          <p>
            Your login token is attached to requests as
            <code> Authorization: Token &lt;token&gt;</code>.
          </p>
        </div>
        <span className="lock">🔐</span>
      </section>

      <form onSubmit={submit} className="card">
        <h2>{editingId ? "Update Student" : "Add Student"}</h2>

        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="number"
          min="1"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <input
          required
          placeholder="Course"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        />

        <div>
          <button type="submit">
            {editingId ? "Update Student" : "Add Student"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyStudent);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && <p className="message">{message}</p>}

      <section className="card">
        <h2>Students</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.age}</td>
                <td>{student.course}</td>
                <td>
                  <button onClick={() => edit(student)}>Edit</button>
                  <button onClick={() => remove(student.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && <p>No students yet.</p>}
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("student_auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem("student_auth_token");
    localStorage.removeItem("student_auth_user");
    setUser(null);
  };

  return user ? (
    <Dashboard user={user} onLogout={logout} />
  ) : (
    <Login onLogin={setUser} />
  );
}
