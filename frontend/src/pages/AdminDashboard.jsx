
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
  consultationFee: '',
  profileImage: ''
};

const emptySpecialization = {
  name: '',
  description: ''
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
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  // Specialization management
  const [specializations, setSpecializations] = useState([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);
  const [specializationError, setSpecializationError] = useState('');
  const [specializationMessage, setSpecializationMessage] = useState('');
  const [showSpecializationForm, setShowSpecializationForm] = useState(false);
  const [editingSpecializationId, setEditingSpecializationId] = useState(null);
  const [specializationSaving, setSpecializationSaving] = useState(false);
  const [specializationForm, setSpecializationForm] =
    useState(emptySpecialization);

    // Patient management
const [patients, setPatients] = useState([]);
const [patientsLoading, setPatientsLoading] = useState(false);
const [patientError, setPatientError] = useState('');

const [selectedPatient, setSelectedPatient] = useState(null);
const [patientAppointments, setPatientAppointments] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState('');

// Appointment management
const [appointments, setAppointments] = useState([]);
const [appointmentsLoading, setAppointmentsLoading] = useState(false);
const [appointmentError, setAppointmentError] = useState('');

const [appointmentFilters, setAppointmentFilters] = useState({
  date: '',
  status: '',
  patientName: '',
  doctorName: ''
});

  // Fetch dashboard statistics
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

  // Fetch all specializations (active and inactive)
  const fetchSpecializations = async () => {
    try {
      setSpecializationsLoading(true);
      setSpecializationError('');

      const response = await api.get('/specializations');
      setSpecializations(response.data.specializations || []);
    } catch (err) {
      setSpecializationError(
        err.response?.data?.message ||
        'Unable to fetch specializations.'
      );
    } finally {
      setSpecializationsLoading(false);
    }
  };
  // Fetch all patients
const fetchPatients = async () => {
  try {
    setPatientsLoading(true);
    setPatientError('');

    const response = await api.get('/admin/patients');
    setPatients(response.data.patients || []);
  } catch (err) {
    setPatientError(
      err.response?.data?.message || 'Unable to fetch patients.'
    );
  } finally {
    setPatientsLoading(false);
  }
};

// Fetch selected patient's appointment history
const fetchPatientHistory = async (patient) => {
  try {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistoryError('');
    setPatientAppointments([]);

    const response = await api.get(
      `/admin/patients/${patient._id}/appointments`
    );

    setPatientAppointments(response.data.appointments || []);
  } catch (err) {
    setHistoryError(
      err.response?.data?.message ||
      'Unable to fetch appointment history.'
    );
  } finally {
    setHistoryLoading(false);
  }
};
const fetchAppointments = async (filters = appointmentFilters) => {
  try {
    setAppointmentsLoading(true);
    setAppointmentError('');

    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => String(value ?? '').trim() !== ''
      )
    );

    const response = await api.get('/admin/appointments', { params });

    setAppointments(response.data.appointments || []);
  } catch (err) {
    setAppointmentError(
      err.response?.data?.message || 'Unable to fetch appointments.'
    );
  } finally {
    setAppointmentsLoading(false);
  }
};

  // Initial dashboard load
  useEffect(() => {
    fetchStats();
  }, []);

  // Load data when opening relevant tabs
 useEffect(() => {
  if (activeTab === 'Doctors') {
    fetchDoctors();
    fetchSpecializations();
  }

  if (activeTab === 'Specializations') {
    fetchSpecializations();
  }

  if (activeTab === 'Patients') {
    setSelectedPatient(null);
    fetchPatients();
  }

  if (activeTab === 'Appointments') {
    fetchAppointments({
      date: '',
      status: '',
      patientName: '',
      doctorName: ''
    });
  }
}, [activeTab]);


  // Doctor form input
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
      consultationFee: doctor.consultationFee ?? '',
      profileImage: doctor.user?.profileImage || ''
    });

    setDoctorError('');
    setDoctorMessage('');
    setShowDoctorForm(true);
  };

  // Upload a doctor photo directly to Cloudinary. Only the resulting URL is sent to the API.
  const handleDoctorPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setDoctorError('Please select a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setDoctorError('Image size must be 2 MB or less.');
      e.target.value = '';
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setDoctorError('Cloudinary is not configured. Check the frontend environment variables and restart Vite.');
      e.target.value = '';
      return;
    }

    try {
      setPhotoUploading(true);
      setDoctorError('');
      setDoctorMessage('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();

      if (!response.ok || !data.secure_url) {
        throw new Error(data.error?.message || 'Cloudinary photo upload failed.');
      }

      handleDoctorChange('profileImage', data.secure_url);
      setDoctorMessage('Photo uploaded. Save the doctor form to keep the photo on the doctor profile.');
    } catch (err) {
      setDoctorError(err.message || 'Unable to upload doctor photo.');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
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
        consultationFee: Number(doctorForm.consultationFee),
        profileImage: doctorForm.profileImage
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

  // Specialization form input
  const handleSpecializationChange = (field, value) => {
    setSpecializationForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Open add specialization form
  const openAddSpecialization = () => {
    setEditingSpecializationId(null);
    setSpecializationForm(emptySpecialization);
    setSpecializationError('');
    setSpecializationMessage('');
    setShowSpecializationForm(true);
  };

  // Open edit specialization form
  const openEditSpecialization = (item) => {
    setEditingSpecializationId(item._id);

    setSpecializationForm({
      name: item.name || '',
      description: item.description || ''
    });

    setSpecializationError('');
    setSpecializationMessage('');
    setShowSpecializationForm(true);
  };

  // Add or update specialization
  const handleSpecializationSubmit = async (e) => {
    e.preventDefault();

    try {
      setSpecializationSaving(true);
      setSpecializationError('');
      setSpecializationMessage('');

      const payload = {
        name: specializationForm.name.trim(),
        description: specializationForm.description.trim()
      };

      if (!payload.name) {
        setSpecializationError(
          'Specialization name is required.'
        );
        return;
      }

      if (editingSpecializationId) {
        await api.put(
          `/specializations/${editingSpecializationId}`,
          payload
        );

        setSpecializationMessage(
          'Specialization updated successfully.'
        );
      } else {
        await api.post('/specializations', payload);

        setSpecializationMessage(
          'Specialization added successfully.'
        );
      }

      setShowSpecializationForm(false);
      setEditingSpecializationId(null);
      setSpecializationForm(emptySpecialization);

      await fetchSpecializations();
    } catch (err) {
      setSpecializationError(
        err.response?.data?.message ||
        'Unable to save specialization.'
      );
    } finally {
      setSpecializationSaving(false);
    }
  };

  // Deactivate specialization
  const handleDeactivateSpecialization = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate this specialization?'
    );

    if (!confirmed) return;

    try {
      setSpecializationError('');
      setSpecializationMessage('');

      await api.patch(`/specializations/${id}/deactivate`);

      setSpecializationMessage(
        'Specialization deactivated successfully.'
      );

      await fetchSpecializations();
    } catch (err) {
      setSpecializationError(
        err.response?.data?.message ||
        'Unable to deactivate specialization.'
      );
    }
  };

  // Sidebar menu
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Doctors', icon: Stethoscope },
    { name: 'Specializations', icon: UserRound },
    { name: 'Patients', icon: Users },
    { name: 'Appointments', icon: CalendarDays }
  ];

  // Dashboard cards
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

  // Page heading
  const pageTitle = showDoctorForm
    ? editingDoctorId
      ? 'Edit Doctor'
      : 'Add Doctor'
    : showSpecializationForm
      ? editingSpecializationId
        ? 'Edit Specialization'
        : 'Add Specialization'
      : activeTab;

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
                  setEditingDoctorId(null);

                  setShowSpecializationForm(false);
                  setEditingSpecializationId(null);

                  setDoctorError('');
                  setDoctorMessage('');
                  setSpecializationError('');
                  setSpecializationMessage('');
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
            <h2 className="page-title">{pageTitle}</h2>

            <p className="page-subtitle">
              Manage your MediCare hospital administration.
            </p>
          </div>

          {/* Dashboard overview */}
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

          {/* Doctor management */}
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
                                  <div className="d-flex align-items-center gap-2">
                                    {doctor.user?.profileImage ? (
                                      <img
                                        src={doctor.user.profileImage}
                                        alt=""
                                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '50%' }}
                                      />
                                    ) : (
                                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                        <Stethoscope size={18} className="text-muted" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="fw-semibold">
                                        {doctor.user?.name || 'Unknown'}
                                  </div>
                                      <small className="text-muted">
                                        {doctor.user?.email || ''}
                                      </small>
                                    </div>
                                  </div>
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

                          {specializations
                            .filter((item) => item.isActive)
                            .map((item) => (
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
                        <label className="form-label">Doctor Photo</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleDoctorPhotoChange}
                          disabled={photoUploading}
                        />
                        <small className="text-muted d-block mt-1">JPG, PNG, or WEBP. Maximum size: 2 MB.</small>
                        {photoUploading && (
                          <small className="text-primary d-block mt-2">Uploading photo...</small>
                        )}
                        {doctorForm.profileImage && (
                          <div className="mt-3">
                            <img
                              src={doctorForm.profileImage}
                              alt="Doctor preview"
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-3"
                              onClick={() => handleDoctorChange('profileImage', '')}
                              disabled={photoUploading}
                            >
                              Remove photo
                            </button>
                          </div>
                        )}
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
                        disabled={doctorSaving || photoUploading}
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

          {/* Specialization management */}
          {activeTab === 'Specializations' && (
            <>
              {specializationError && (
                <div className="alert alert-danger">
                  {specializationError}
                </div>
              )}

              {specializationMessage && (
                <div className="alert alert-success">
                  {specializationMessage}
                </div>
              )}

              {!showSpecializationForm ? (
                <>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                      <h5 className="mb-1">
                        Specialization Directory
                      </h5>
                      <small className="text-muted">
                        Manage hospital departments and specializations.
                      </small>
                    </div>

                    <button
                      className="btn btn-primary-custom"
                      onClick={openAddSpecialization}
                    >
                      <Plus size={18} className="me-2" />
                      Add Specialization
                    </button>
                  </div>

                  {specializationsLoading ? (
                    <p>Loading specializations...</p>
                  ) : specializations.length === 0 ? (
                    <div className="card p-4 text-center">
                      <UserRound size={35} className="mx-auto mb-3" />
                      <h5>No specializations found</h5>
                      <p className="text-muted mb-0">
                        Add your first specialization.
                      </p>
                    </div>
                  ) : (
                    <div className="card p-3">
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Specialization</th>
                              <th>Description</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {specializations.map((item) => (
                              <tr key={item._id}>
                                <td className="fw-semibold">
                                  {item.name}
                                </td>

                                <td>
                                  {item.description || 'N/A'}
                                </td>

                                <td>
                                  <span
                                    className={`badge ${
                                      item.isActive
                                        ? 'bg-success'
                                        : 'bg-secondary'
                                    }`}
                                  >
                                    {item.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>

                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      title="Edit specialization"
                                      onClick={() =>
                                        openEditSpecialization(item)
                                      }
                                    >
                                      <Edit size={16} />
                                    </button>

                                    {item.isActive && (
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Deactivate specialization"
                                        onClick={() =>
                                          handleDeactivateSpecialization(
                                            item._id
                                          )
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
                <div className="card p-4">
                  <form onSubmit={handleSpecializationSubmit}>
                    <div className="mb-3">
                      <label className="form-label">
                        Specialization Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={specializationForm.name}
                        onChange={(e) =>
                          handleSpecializationChange(
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Cardiology"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>

                      <textarea
                        className="form-control"
                        rows="4"
                        value={specializationForm.description}
                        onChange={(e) =>
                          handleSpecializationChange(
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Enter specialization description"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary-custom"
                        disabled={specializationSaving}
                      >
                        {specializationSaving
                          ? 'Saving...'
                          : editingSpecializationId
                            ? 'Update Specialization'
                            : 'Add Specialization'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowSpecializationForm(false);
                          setEditingSpecializationId(null);
                          setSpecializationForm(emptySpecialization);
                          setSpecializationError('');
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

          {/* Patients and Appointments - next implementation */}
          {/* Patients Management */}
{activeTab === 'Patients' && (
  <>
    {patientError && (
      <div className="alert alert-danger">{patientError}</div>
    )}

    {historyError && (
      <div className="alert alert-danger">{historyError}</div>
    )}

    {!selectedPatient ? (
      <>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h5 className="mb-1">Patient Directory</h5>
            <small className="text-muted">
              View registered patients and their appointment records.
            </small>
          </div>

          <button
            className="btn btn-outline-secondary"
            onClick={fetchPatients}
            disabled={patientsLoading}
          >
            <RefreshCw size={16} className="me-2" />
            Refresh
          </button>
        </div>

        {patientsLoading ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
          <div className="card p-4 text-center">
            <Users size={35} className="mx-auto mb-3" />
            <h5>No patients found</h5>
            <p className="text-muted mb-0">
              Registered patients will appear here.
            </p>
          </div>
        ) : (
          <div className="card p-3">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email</th>
                    
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id}>
                      <td className="fw-semibold">
                        {patient.name || 'N/A'}
                      </td>

                      <td>{patient.email || 'N/A'}</td>


                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => fetchPatientHistory(patient)}
                        >
                          View History
                        </button>
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
      <>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h5 className="mb-1">
              {selectedPatient.name}'s Appointment History
            </h5>
            <small className="text-muted">
              {selectedPatient.email}
            </small>
          </div>

          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setSelectedPatient(null);
              setPatientAppointments([]);
              setHistoryError('');
            }}
          >
            Back to Patients
          </button>
        </div>

        {historyLoading ? (
          <p>Loading appointment history...</p>
        ) : patientAppointments.length === 0 ? (
          <div className="card p-4 text-center">
            <CalendarDays size={35} className="mx-auto mb-3" />
            <h5>No appointments found</h5>
            <p className="text-muted mb-0">
              This patient has no appointment records.
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
                    <th>Appointment Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {patientAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        {appointment.doctor?.user?.name || 'N/A'}
                      </td>

                      <td>
                        {appointment.doctor?.specialization?.name || 'N/A'}
                      </td>

                      <td>
                        {appointment.appointmentDate
                          ? new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>

                      <td>{appointment.reason || 'N/A'}</td>

                      <td>
                        <span
                          className={`badge ${
                            appointment.status === 'confirmed'
                              ? 'bg-success'
                              : appointment.status === 'completed'
                                ? 'bg-primary'
                                : appointment.status === 'cancelled'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                          }`}
                        >
                          {appointment.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )}
  </>
)}

{/* Appointments placeholder */}
{/* Appointments Management */}
{activeTab === 'Appointments' && (
  <>
    <div className="mb-4">
      <h2 className="page-title">Appointments Management</h2>
      <p className="page-subtitle">
        View and filter all patient appointments.
      </p>
    </div>

    {/* Filters */}
    <div className="card p-4 mb-4">
      <h5 className="mb-3">Filter Appointments</h5>

      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Appointment Date</label>
          <input
            type="date"
            className="form-control"
            value={appointmentFilters.date}
            onChange={(e) =>
              setAppointmentFilters({
                ...appointmentFilters,
                date: e.target.value
              })
            }
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={appointmentFilters.status}
            onChange={(e) =>
              setAppointmentFilters({
                ...appointmentFilters,
                status: e.target.value
              })
            }
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Patient Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search patient"
            value={appointmentFilters.patientName}
            onChange={(e) =>
              setAppointmentFilters({
                ...appointmentFilters,
                patientName: e.target.value
              })
            }
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Doctor Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search doctor"
            value={appointmentFilters.doctorName}
            onChange={(e) =>
              setAppointmentFilters({
                ...appointmentFilters,
                doctorName: e.target.value
              })
            }
          />
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-primary-custom"
          onClick={() => fetchAppointments(appointmentFilters)}
          disabled={appointmentsLoading}
        >
          {appointmentsLoading ? 'Searching...' : 'Apply Filters'}
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            const emptyFilters = {
              date: '',
              status: '',
              patientName: '',
              doctorName: ''
            };

            setAppointmentFilters(emptyFilters);
            fetchAppointments(emptyFilters);
          }}
          disabled={appointmentsLoading}
        >
          Clear Filters
        </button>
      </div>
    </div>

    {/* Appointments Table */}
    <div className="card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">All Appointments</h5>
        <span className="text-muted">
          {appointments.length} records
        </span>
      </div>

      {appointmentsLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-info" />
          <p className="text-muted mt-2">Loading appointments...</p>
        </div>
      ) : appointmentError ? (
        <div className="alert alert-danger">
          {appointmentError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => fetchAppointments(appointmentFilters)}
          >
            Retry
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-4">
          <CalendarDays size={35} className="text-muted mb-2" />
          <h6>No appointments found</h6>
          <p className="text-muted mb-0">
            There are no appointments matching your filters.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="fw-semibold">
                    {appointment.patient?.name || 'N/A'}
                  </td>

                  <td>
                    {appointment.doctor?.user?.name || 'N/A'}
                  </td>

                  <td>
                    {appointment.doctor?.specialization?.name || 'N/A'}
                  </td>

                  <td>
                    {appointment.appointmentDate
                      ? new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })
                      : 'N/A'}
                  </td>

                  <td>
                    {appointment.reason || '-'}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        appointment.status === 'confirmed'
                          ? 'bg-success'
                          : appointment.status === 'completed'
                            ? 'bg-primary'
                            : appointment.status === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                      }`}
                    >
                      {appointment.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
)}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
