import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    const user = useAuthStore.getState().user;
    if (user) navigate('/wines');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-in">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your wine market account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn--primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <br />
          <code>admin@wine.local</code> / <code>password123</code>
          <br />
          <code>retail@wine.local</code> / <code>password123</code>
          <br />
          <code>customer@wine.local</code> / <code>password123</code>
        </div>
      </div>
    </div>
  );
}
