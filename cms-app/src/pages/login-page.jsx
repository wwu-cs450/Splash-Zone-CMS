import { useState } from 'react';
import { useNavigate } from 'react-router';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showForgotOptions, setShowForgotOptions] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isCreatingAccount) {
      // Create account logic
      if (password !== confirmPassword) {
        alert("Passwords don&apos;t match!");
        return;
      }
      // Account creation - removed console.log
      alert('Account created! You can now login.');
      setIsCreatingAccount(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      // Login logic
      if (username && password) {
        // TODO: Add actual authentication
        navigate('/search');
      }
    }
  };

  const handleForgotCredentials = () => {
    setShowForgotOptions(true);
  };

  const handleContactAdmin = () => {
    alert('Please contact The Wash Zone administrator at:\nPhone: (555) 123-4567\nEmail: admin@washzone.com\nLocation: 1907 E Isaac Ave, Walla Walla WA');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #0077be 0%, #00a8e8 50%, #87ceeb 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Car Wash Bubbles Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 2%, transparent 2.5%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 1%, transparent 1.5%),
          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 1%, transparent 1.2%),
          radial-gradient(circle at 60% 60%, rgba(255,255,255,0.3) 1%, transparent 1.5%),
          radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 1%, transparent 1.3%)
        `,
        backgroundSize: '200px 200px',
        animation: 'bubbleFloat 20s infinite linear'
      }}></div>

      {/* Water Stream Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        width: '4px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'waterStream 3s infinite linear'
      }}></div>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        width: '380px',
        position: 'relative',
        zIndex: 1,
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Car Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem'
          }}>🚗</div>
          <h2 style={{ 
            margin: 0, 
            color: '#2c5530',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            Wash Zone CMS
          </h2>
          <p style={{ 
            margin: '0.5rem 0 0 0',
            color: '#666',
            fontSize: '1rem'
          }}>
            Customer Management System
          </p>
        </div>
        
        {!showForgotOptions ? (
          <>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#2c5530'
            }}>
              {isCreatingAccount ? 'Create Account' : 'Login'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Username:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5530'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5530'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  required
                />
              </div>

              {isCreatingAccount && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2c5530'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    required
                  />
                </div>
              )}

              {/* Forgot Password Link */}
              {!isCreatingAccount && (
                <div style={{ 
                  textAlign: 'right', 
                  marginBottom: '1.5rem'
                }}>
                  <button
                    type="button"
                    onClick={handleForgotCredentials}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2c5530',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Forgot username or password?
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2c5530',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a24'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2c5530'}
              >
                {isCreatingAccount ? 'Create Account' : 'Login'}
              </button>
            </form>

            <button
              onClick={() => setIsCreatingAccount(!isCreatingAccount)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'transparent',
                color: '#2c5530',
                border: '2px solid #2c5530',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2c5530';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#2c5530';
              }}
            >
              {isCreatingAccount ? '← Back to Login' : 'Create New Account'}
            </button>
          </>
        ) : (
          /* Forgot Password/Username Section */
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#2c5530'
            }}>
              Need Help Signing In?
            </h3>
            
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                If you&apos;ve forgotten your username or password, please contact the administrator for assistance.
              </p>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleContactAdmin}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2c5530',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a24'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2c5530'}
                >
                  Contact Administrator
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowForgotOptions(false)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'transparent',
                color: '#2c5530',
                border: '2px solid #2c5530',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes bubbleFloat {
            0% { background-position: 0 0; }
            100% { background-position: 200px 200px; }
          }
          @keyframes waterStream {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}
      </style>
    </div>
  );
}

export default LoginPage;