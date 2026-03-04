import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth.store';

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
      <div className="auth-card animate-in">
        <h1>Welcome</h1>
        <p className="auth-subtitle">Sign in to your wine market account</p>

        {error && <div className="error-msg">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          {isLoading ? (
            <p>Signing in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error('Google login failed')}
              size="large"
              theme="outline"
              text="signin_with"
              shape="rectangular"
              width="300"
            />
          )}
        </div>
      </div>
    </div>
  );
}
