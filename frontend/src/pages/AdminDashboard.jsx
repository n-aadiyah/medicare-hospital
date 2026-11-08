
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  UserX,
  RefreshCw
} from 'lucide-react';
import './AdminDashboard.css';

const emptyDoctor = {
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  experience: '',
  bio: '',
  consultationFee: ''
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activePatients: 0,
    totalDoctors: 0,
    availableDoctors: 0,
    unavailableDoctors: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor management
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [doctorMessage, setDoctorMessage] = useState('');

  const [specializations, setSpecializations] = useState([]);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorSaving, setDoctorSaving] = useState(false);

  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  // Dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/dashboard-stats');

      setStats(response.data.stats || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load dashboard statistics.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      setDoctorError('');

      const response = await api.get('/doctors');

      setDoctors(response.data.doctors || []);
    } catch (err) {
      setDoctorError(
        err.response?.data?.message || 'Unable to fetch doctors.'
      );
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Fetch specializations
  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/specializations');

      setSpecializations(
        (response.data.specializations || []).filter(
          (item) => item.isActive
        )
      );
    } catch (err) {
      setDoctorError(
        err.response?.data?.message ||
        'Unable to fetch specializations.'
      );
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'Doctors') {
      fetchDoctors();
      fetchSpecializations();
    }
  }, [activeTab]);

  // Form input handler
  const handleDoctorChange = (field, value) => {
    setDoctorForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Open add doctor form
  const openAddDoctorForm = () => {
    setEditingDoctorId(null);
    setDoctorForm(emptyDoctor);
    setDoctorError('');
    setDoctorMessage('');
    setShowDoctorForm(true);
  };

  // Open edit doctor form
  const openEditDoctorForm = (doctor) => {
    setEditingDoctorId(doctor._id);

    setDoctorForm({
      name: doctor.user?.name || '',
      username: doctor.user?.username || '',
      email: doctor.user?.email || '',
      phone: doctor.user?.phone || '',
      password: '',
      specialization: doctor.specialization?._id || '',
      experience: doctor.experience ?? '',
      bio: doctor.bio || '',
      consultationFee: doctor.consultationFee ?? ''
    });

    setDoctorError('');
    setDoctorMessage('');
    setShowDoctorForm(true);
  };

  // Add or update doctor
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();

    try {
      setDoctorSaving(true);
      setDoctorError('');
      setDoctorMessage('');

      const payload = {
        name: doctorForm.name.trim(),
        username: doctorForm.username.trim(),
        email: doctorForm.email.trim(),
        phone: doctorForm.phone.trim(),
        specialization: doctorForm.specialization,
        experience: Number(doctorForm.experience),
        bio: doctorForm.bio.trim(),
        consultationFee: Number(doctorForm.consultationFee)
      };

      if (!editingDoctorId) {
        if (!doctorForm.password.trim()) {
          setDoctorError('Password is required for a new doctor.');
          return;
        }

        payload.password = doctorForm.password;
        await api.post('/doctors', payload);

        setDoctorMessage('Doctor added successfully.');
      } else {
        await api.put(`/doctors/${editingDoctorId}`, payload);

        setDoctorMessage('Doctor updated successfully.');
      }

      setShowDoctorForm(false);
      setDoctorForm(emptyDoctor);
      setEditingDoctorId(null);

      await fetchDoctors();
      await fetchStats();
    } catch (err) {
      setDoctorError(
        err.response?.data?.message ||
        'Unable to save doctor details.'
      );
    } finally {
      setDoctorSaving(false);
    }
  };

  // Deactivate doctor
  const handleDeactivateDoctor = async (doctorId) => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this doctor?'
    );

    if (!confirmed) return;

    try {
      setDoctorError('');
      setDoctorMessage('');

      await api.patch(`/doctors/${doctorId}/deactivate`);

      setDoctorMessage('Doctor deactivated successfully.');

      await fetchDoctors();
      await fetchStats();
    } catch (err) {
      setDoctorError(
        err.response?.data?.message ||
        'Unable to deactivate doctor.'
      );
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Doctors', icon: Stethoscope },
    { name: 'Specializations', icon: UserRound },
    { name: 'Patients', icon: Users },
    { name: 'Appointments', icon: CalendarDays }
  ];

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: CalendarDays
    },
    {
      title: 'Active Patients',
      value: stats.activePatients,
      icon: Users
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: Stethoscope
    },
    {
      title: 'Available Doctors',
      value: stats.availableDoctors,
      icon: UserRound
    },
    {
      title: 'Unavailable Doctors',
      value: stats.unavailableDoctors,
      icon: UserRound
    }
  ];

  return (
    <div className="admin-layout">

      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="admin-brand">
          <Stethoscope size={27} />
          <span>MediCare</span>
        </div>

        <p className="admin-menu-label">MAIN MENU</p>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`admin-nav-item ${
                  activeTab === item.name ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                  setShowDoctorForm(false);
                  setDoctorError('');
                  setDoctorMessage('');
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={logout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">

        <header className="admin-header">
          <button
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>

          <div>
            <h5>Admin Portal</h5>
            <small>Hospital Management System</small>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span>{user?.name || 'Administrator'}</span>
          </div>
        </header>

        <div className="admin-content">

          <div className="mb-4">
            <h2 className="page-title">
              {showDoctorForm
                ? editingDoctorId
                  ? 'Edit Doctor'
                  : 'Add Doctor'
                : activeTab}
            </h2>

            <p className="page-subtitle">
              Manage your MediCare hospital administration.
            </p>
          </div>

          {/* Dashboard */}
          {activeTab === 'Dashboard' && (
            <>
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {loading ? (
                <p>Loading dashboard statistics...</p>
              ) : (
                <>
                  <div className="row g-4">
                    {statCards.map((card) => {
                      const Icon = card.icon;

                      return (
                        <div
                          className="col-12 col-sm-6 col-xl-4"
                          key={card.title}
                        >
                          <div className="card admin-stat-card">
                            <div className="admin-stat-icon">
                              <Icon size={23} />
                            </div>

                            <p>{card.title}</p>
                            <h3>{card.value}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-end">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={fetchStats}
                    >
                      <RefreshCw size={16} className="me-2" />
                      Refresh Statistics
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Doctors */}
          {activeTab === 'Doctors' && (
            <>
              {doctorError && (
                <div className="alert alert-danger">
                  {doctorError}
                </div>
              )}

              {doctorMessage && (
                <div className="alert alert-success">
                  {doctorMessage}
                </div>
              )}

              {!showDoctorForm ? (
                <>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                      <h5 className="mb-1">Doctor Directory</h5>
                      <small className="text-muted">
                        Manage registered doctors.
                      </small>
                    </div>

                    <button
                      className="btn btn-primary-custom"
                      onClick={openAddDoctorForm}
                    >
                      <Plus size={18} className="me-2" />
                      Add Doctor
                    </button>
                  </div>

                  {doctorsLoading ? (
                    <p>Loading doctors...</p>
                  ) : doctors.length === 0 ? (
                    <div className="card p-4 text-center">
                      <Stethoscope size={35} className="mx-auto mb-3" />
                      <h5>No doctors found</h5>
                      <p className="text-muted mb-0">
                        Add your first doctor to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="card p-3">
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Doctor</th>
                              <th>Specialization</th>
                              <th>Experience</th>
                              <th>Consultation Fee</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {doctors.map((doctor) => (
                              <tr key={doctor._id}>
                                <td>
                                  <div className="fw-semibold">
                                    {doctor.user?.name || 'Unknown'}
                                  </div>
                                  <small className="text-muted">
                                    {doctor.user?.email || ''}
                                  </small>
                                </td>

                                <td>
                                  {doctor.specialization?.name || 'N/A'}
                                </td>

                                <td>
                                  {doctor.experience ?? 0} years
                                </td>

                                <td>
                                  ₹{doctor.consultationFee ?? 0}
                                </td>

                                <td>
                                  <span
                                    className={`badge ${
                                      doctor.isAvailable
                                        ? 'bg-success'
                                        : 'bg-secondary'
                                    }`}
                                  >
                                    {doctor.isAvailable
                                      ? 'Available'
                                      : 'Unavailable'}
                                  </span>
                                </td>

                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      title="Edit doctor"
                                      onClick={() =>
                                        openEditDoctorForm(doctor)
                                      }
                                    >
                                      <Edit size={16} />
                                    </button>

                                    {doctor.isAvailable && (
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Deactivate doctor"
                                        onClick={() =>
                                          handleDeactivateDoctor(doctor._id)
                                        }
                                      >
                                        <UserX size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Add/Edit Doctor Form */
                <div className="card p-4">
                  <form onSubmit={handleDoctorSubmit}>
                    <div className="row g-3">

                      <div className="col-md-6">
                        <label className="form-label">Full Name *</label>
                        <input
                          className="form-control"
                          value={doctorForm.name}
                          onChange={(e) =>
                            handleDoctorChange('name', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Username *</label>
                        <input
                          className="form-control"
                          value={doctorForm.username}
                          onChange={(e) =>
                            handleDoctorChange('username', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={doctorForm.email}
                          onChange={(e) =>
                            handleDoctorChange('email', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          className="form-control"
                          value={doctorForm.phone}
                          onChange={(e) =>
                            handleDoctorChange('phone', e.target.value)
                          }
                        />
                      </div>

                      {!editingDoctorId && (
                        <div className="col-md-6">
                          <label className="form-label">Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            value={doctorForm.password}
                            onChange={(e) =>
                              handleDoctorChange('password', e.target.value)
                            }
                            required
                          />
                        </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label">
                          Specialization *
                        </label>
                        <select
                          className="form-select"
                          value={doctorForm.specialization}
                          onChange={(e) =>
                            handleDoctorChange(
                              'specialization',
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Select specialization</option>

                          {specializations.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Experience (years) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={doctorForm.experience}
                          onChange={(e) =>
                            handleDoctorChange('experience', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Consultation Fee (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={doctorForm.consultationFee}
                          onChange={(e) =>
                            handleDoctorChange(
                              'consultationFee',
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Bio</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={doctorForm.bio}
                          onChange={(e) =>
                            handleDoctorChange('bio', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary-custom"
                        disabled={doctorSaving}
                      >
                        {doctorSaving
                          ? 'Saving...'
                          : editingDoctorId
                            ? 'Update Doctor'
                            : 'Add Doctor'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowDoctorForm(false);
                          setDoctorForm(emptyDoctor);
                          setEditingDoctorId(null);
                          setDoctorError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Other sections - to be implemented */}
          {activeTab !== 'Dashboard' && activeTab !== 'Doctors' && (
            <div className="card p-4">
              <h5>{activeTab} Management</h5>
              <p className="text-muted mb-0">
                This section will be implemented next.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
