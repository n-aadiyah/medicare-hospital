
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const {
    sendPatientOTP,
    verifyPatientOTP,
    doctorAdminLogin,
    loading,
  } = useAuth();

  const [loginType, setLoginType] = useState('patient');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await sendPatientOTP(email);
      setOtpSent(true);
      setMessage(result.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await verifyPatientOTP(email, otp);
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await doctorAdminLogin(username, password);

      if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/doctor/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  const changeLoginType = (type) => {
    setLoginType(type);
    setMessage('');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-4">
          <div className="col-lg-10">
            <div className="row login-card g-0 overflow-hidden">

              <div className="col-md-5 login-brand">
                <div>
                  <div className="brand-icon">✚</div>
                  <h1>MediCare</h1>
                  <h4>Your Health, Our Priority</h4>
                  <p>
                    Book appointments, connect with doctors and
                    manage your healthcare in one place.
                  </p>
                </div>
                <div className="brand-footer">
                  Trusted healthcare management
                </div>
              </div>

              <div className="col-md-7 login-form-section">
                <h2>Welcome Back</h2>
                <p className="login-subtitle">
                  Sign in to continue to MediCare
                </p>

                <div className="login-tabs">
                  <button
                    type="button"
                    className={loginType === 'patient' ? 'active' : ''}
                    onClick={() => changeLoginType('patient')}
                  >
                    Patient
                  </button>

                  <button
                    type="button"
                    className={loginType === 'staff' ? 'active' : ''}
                    onClick={() => changeLoginType('staff')}
                  >
                    Doctor / Admin
                  </button>
                </div>

                {message && (
                  <div className="alert alert-success">{message}</div>
                )}

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                {loginType === 'patient' ? (
                  <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control mb-3"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={otpSent}
                    />

                    {otpSent && (
                      <>
                        <label className="form-label">Verification OTP</label>
                        <input
                          type="text"
                          className="form-control mb-3"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          inputMode="numeric"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          required
                        />
                      </>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary-custom w-100 mt-2"
                      disabled={loading}
                    >
                      {loading
                        ? 'Please wait...'
                        : otpSent
                          ? 'Verify OTP & Login'
                          : 'Send OTP'}
                    </button>

                    {otpSent && (
                      <button
                        type="button"
                        className="btn btn-link w-100 mt-2"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setMessage('');
                          setError('');
                        }}
                      >
                        Change email / Request new OTP
                      </button>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleStaffLogin}>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />

                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control mb-3"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="submit"
                      className="btn btn-primary-custom w-100 mt-2"
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : 'Login'}
                    </button>
                  </form>
                )}

                <p className="login-bottom-text">
                  Secure healthcare access powered by MediCare
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
