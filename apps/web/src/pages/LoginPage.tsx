import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth.store';

const WineGlassIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L16 2L14 10C13.5 13 11 14 11 14L11 20L14 20L14 22L10 22L10 20L13 20L13 14C13 14 10.5 13 10 10L8 2Z" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="12" cy="7" rx="3.5" ry="2" fill="rgba(201,168,76,0.4)"/>
    <rect x="9" y="20" width="6" height="1.5" rx="0.75" fill="rgba(255,255,255,0.7)"/>
  </svg>
);

export function LoginPage() {
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      await googleLogin(response.credential);
      const user = useAuthStore.getState().user;
      if (user) navigate('/wines');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split animate-in">
        {/* ── Left: atmospheric panel ── */}
        <div className="auth-split-left">
          <div className="auth-split-left-inner">
            <div className="auth-logo">
              <div className="logo-icon">
                <WineGlassIcon />
              </div>
              <span>Wine Market</span>
            </div>

            <h1>
              Discover <em>exceptional</em><br />wines together
            </h1>
            <p className="auth-tagline">
              Join a community of wine lovers. Browse curated selections, participate in group orders, and get premium bottles delivered to your door.
            </p>

            <ul className="auth-features">
              <li>
                <div className="feat-icon">🍷</div>
                <div className="feat-text">
                  <strong>Curated Wine Catalog</strong>
                  Hundreds of hand-picked wines from top regions worldwide
                </div>
              </li>
              <li>
                <div className="feat-icon">🤝</div>
                <div className="feat-text">
                  <strong>Group Orders</strong>
                  Team up with colleagues to meet minimums and save on shipping
                </div>
              </li>
              <li>
                <div className="feat-icon">📦</div>
                <div className="feat-text">
                  <strong>Order Tracking</strong>
                  Follow your orders from enrollment through to delivery
                </div>
              </li>
            </ul>

            <div className="auth-quote">
              <p>"Wine is the most civilized thing in the world."</p>
            </div>
          </div>
        </div>

        {/* ── Right: login form ── */}
        <div className="auth-split-right">
          <div className="auth-form-inner">
            <h2>Welcome back</h2>
            <p className="auth-subtitle">
              Sign in to access your account, browse the catalog, and manage your orders.
            </p>

            {error && <div className="error-msg" style={{ marginBottom: 'var(--space-lg)' }}>{error}</div>}

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--gray-500)' }}>
                <div className="spinner" style={{ padding: 'var(--space-md)' }} />
                Signing you in...
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error('Google login failed')}
                  size="large"
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                />
              </div>
            )}

            <div className="auth-divider">Secure sign-in</div>

            <div className="auth-form-footer">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and never shared.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
