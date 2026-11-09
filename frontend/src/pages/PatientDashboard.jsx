
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  FileText,
  UserRound,
  LogOut,
  Menu,
  HeartPulse,
  Search,
  ArrowLeft,
  CheckCircle,
  Pill,
ClipboardList,
CalendarClock,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PatientDashboard.css';

function PatientDashboard() {
  const { user, logout } = useAuth();

  const [activePage, setActivePage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');

  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
const [loadingAppointments, setLoadingAppointments] = useState(false);
const [prescriptions, setPrescriptions] = useState([]);
const [prescriptionSearch, setPrescriptionSearch] = useState('');
const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Find Doctors', icon: Stethoscope },
    { name: 'My Appointments', icon: CalendarDays },
    { name: 'Prescriptions', icon: FileText },
    { name: 'My Profile', icon: UserRound },
  ];

  // Fetch active specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      setLoadingSpecializations(true);

      try {
        const response = await api.get('/specializations/public');
        setSpecializations(response.data.specializations || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load specializations.'
        );
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  // Fetch doctors
  useEffect(() => {
    if (activePage !== 'Find Doctors') return;

    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      setError('');

      try {
        const response = await api.get('/doctors/public', {
          params: selectedSpecialization
            ? { specialization: selectedSpecialization }
            : {},
        });

        setDoctors(response.data.doctors || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Unable to load doctors.'
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [activePage, selectedSpecialization]);
  useEffect(() => {
  if (activePage !== 'My Appointments') return;

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setError('');

    try {
      const response = await api.get('/appointments/patient');
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your appointments.'
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  fetchAppointments();
}, [activePage]);

useEffect(() => {
  if (activePage !== 'Prescriptions') return;

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    setError('');

    try {
      const response = await api.get('/prescriptions/patient');
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your prescriptions.'
      );
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  fetchPrescriptions();
}, [activePage]);
  // Fetch a doctor's available dates
  const handleViewDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setAvailability([]);
    setSelectedDate('');
    setReason('');
    setError('');
    setSuccess('');
    setLoadingAvailability(true);

    try {
      const response = await api.get(
        `/availability/doctor/${doctor._id}`
      );

      setAvailability(response.data.availability || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load doctor availability.'
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Book appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate) {
      setError('Please select an appointment date.');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        reason: reason.trim(),
      });

      setSuccess(
        response.data.message || 'Appointment booked successfully!'
      );

      setSelectedDate('');
      setReason('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to book appointment. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setSelectedDoctor(null);
    setError('');
    setSuccess('');
    setSidebarOpen(false);
  };

  const formatDate = (dateValue) => {
    const dateString = dateValue.slice(0, 10);
    const [year, month, day] = dateString.split('-');

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Doctor profile and booking view
  const renderDoctorProfile = () => (
    <>
      <button
        className="btn btn-light border mb-4"
        onClick={() => {
          setSelectedDoctor(null);
          setError('');
          setSuccess('');
        }}
      >
        <ArrowLeft size={17} className="me-2" />
        Back to Doctors
      </button>

      <div className="card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          {selectedDoctor.user?.profileImage ? (
            <img
              src={selectedDoctor.user.profileImage}
              alt={selectedDoctor.user.name}
              className="doctor-profile-avatar"
            />
          ) : (
            <div className="doctor-profile-avatar doctor-avatar-fallback">
              {selectedDoctor.user?.name?.charAt(0)?.toUpperCase() || 'D'}
            </div>
          )}

          <div>
            <h3 className="mb-2">
              Dr. {selectedDoctor.user?.name || 'Doctor'}
            </h3>

            <p className="text-primary mb-2">
              {selectedDoctor.specialization?.name || 'Specialist'}
            </p>

            <p className="text-muted mb-2">
              {selectedDoctor.experience} years of experience
            </p>

            <h6 className="mb-0">
              Consultation Fee: ₹{selectedDoctor.consultationFee}
            </h6>
          </div>
        </div>

        <hr />

        <h5>About Doctor</h5>
        <p className="text-muted mb-0">
          {selectedDoctor.bio || 'No biography available.'}
        </p>
      </div>

      <div className="card p-4">
        <h4 className="mb-2">Book an Appointment</h4>
        <p className="text-muted">
          Select one of the dates made available by this doctor.
        </p>

        {loadingAvailability ? (
          <p>Loading available dates...</p>
        ) : availability.length === 0 ? (
          <div className="alert alert-warning mb-0">
            No upcoming appointment dates are currently available
            for this doctor.
          </div>
        ) : (
          <form onSubmit={handleBookAppointment}>
            <label className="form-label fw-semibold">
              Select Appointment Date
            </label>

            <div className="row g-3 mb-4">
              {availability.map((item) => {
                const dateValue = item.date.slice(0, 10);

                return (
                  <div className="col-6 col-md-4 col-lg-3" key={item._id}>
                    <button
                      type="button"
                      className={`date-option ${
                        selectedDate === dateValue ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setSelectedDate(dateValue);
                        setError('');
                      }}
                    >
                      <CalendarDays size={20} />
                      <span>{formatDate(item.date)}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Reason for Visit (Optional)
              </label>

              <textarea
                className="form-control"
                rows="3"
                maxLength="500"
                placeholder="Briefly describe your health concern..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom"
              disabled={!selectedDate || bookingLoading}
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        )}
      </div>
    </>
  );
  const renderMyAppointments = () => (
  <>
    <h2>My Appointments</h2>
    <p className="text-muted">
      View your appointment history and current status.
    </p>

    {loadingAppointments ? (
      <p>Loading your appointments...</p>
    ) : appointments.length === 0 ? (
      <div className="card p-4 text-center mt-4">
        <CalendarDays size={35} className="mx-auto mb-2 text-muted" />
        <h5>No Appointments Yet</h5>
        <p className="text-muted mb-3">
          You haven't booked any appointments.
        </p>
        <button
          className="btn btn-primary-custom"
          onClick={() => handlePageChange('Find Doctors')}
        >
          Find a Doctor
        </button>
      </div>
    ) : (
      <div className="row g-3 mt-2">
        {appointments.map((appointment) => {
          const doctor = appointment.doctor;
          const status = appointment.status || 'pending';

          const statusClass = {
            pending: 'bg-warning text-dark',
            confirmed: 'bg-success',
            completed: 'bg-primary',
            cancelled: 'bg-danger',
          }[status] || 'bg-secondary';

          return (
            <div className="col-12 col-lg-6" key={appointment._id}>
              <div className="card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h5 className="mb-1">
                      Dr. {doctor?.user?.name || 'Doctor'}
                    </h5>
                    <p className="text-muted small mb-2">
                      {doctor?.specialization?.name || 'Specialist'}
                    </p>
                  </div>

                  <span className={`badge ${statusClass}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                <hr />

                <p className="mb-2">
                  <CalendarDays size={17} className="me-2 text-primary" />
                  <strong>Date:</strong>{' '}
                  {appointment.appointmentDate
                    ? formatDate(appointment.appointmentDate)
                    : 'Not available'}
                </p>

                <p className="mb-0">
                  <strong>Reason:</strong>{' '}
                  {appointment.reason || 'Not specified'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>
);


const renderPrescriptions = () => {
  const totalMedicines = prescriptions.reduce(
    (total, prescription) =>
      total + (prescription.medicines?.length || 0),
    0
  );

  const uniqueDoctors = new Set(
    prescriptions
      .map((prescription) => prescription.doctor?.user?.name)
      .filter(Boolean)
  ).size;

  const followUpCount = prescriptions.filter(
    (prescription) => prescription.followUpDate
  ).length;

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const doctorName = prescription.doctor?.user?.name || '';
    const medicineNames = (prescription.medicines || [])
      .map((medicine) => medicine.name || '')
      .join(' ');
    const notes = prescription.notes || '';

    const searchText =
      `${doctorName} ${medicineNames} ${notes}`.toLowerCase();

    return searchText.includes(prescriptionSearch.toLowerCase().trim());
  });

  return (
    <div className="prescription-page">
      {/* Page heading */}
      <div className="prescription-heading">
        <div>
          <span className="prescription-eyebrow">
            PATIENT HEALTH RECORDS
          </span>
          <h2>My Prescriptions</h2>
          <p>
            View your prescribed medicines, doctor's instructions and
            follow-up information in one place.
          </p>
        </div>

        <div className="prescription-heading-icon">
          <FileText size={30} />
        </div>
      </div>

      {/* Summary cards */}
      {!loadingPrescriptions && prescriptions.length > 0 && (
        <div className="row g-3 prescription-stats">
          <div className="col-6 col-xl-3">
            <div className="prescription-stat-card">
              <div className="prescription-stat-icon teal">
                <ClipboardList size={21} />
              </div>
              <div>
                <h3>{prescriptions.length}</h3>
                <p>Total Prescriptions</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="prescription-stat-card">
              <div className="prescription-stat-icon blue">
                <Pill size={21} />
              </div>
              <div>
                <h3>{totalMedicines}</h3>
                <p>Prescribed Medicines</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="prescription-stat-card">
              <div className="prescription-stat-icon purple">
                <Stethoscope size={21} />
              </div>
              <div>
                <h3>{uniqueDoctors}</h3>
                <p>Doctors Consulted</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="prescription-stat-card">
              <div className="prescription-stat-icon orange">
                <CalendarClock size={21} />
              </div>
              <div>
                <h3>{followUpCount}</h3>
                <p>Follow-up Dates</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription list heading and search */}
      <div className="prescription-list-header">
        <div>
          <h4>Prescription History</h4>
          <p>All prescriptions issued by your doctors</p>
        </div>

        {!loadingPrescriptions && prescriptions.length > 0 && (
          <div className="prescription-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medicines or doctors..."
              value={prescriptionSearch}
              onChange={(e) => setPrescriptionSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Loading */}
      {loadingPrescriptions ? (
        <div className="prescription-message-card">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading prescriptions</h5>
          <p>Please wait while we retrieve your records.</p>
        </div>
      ) : prescriptions.length === 0 ? (
        /* No prescriptions */
        <div className="prescription-message-card">
          <div className="prescription-empty-icon">
            <FileText size={35} />
          </div>
          <h5>No Prescriptions Yet</h5>
          <p>
            Your prescriptions will appear here after your doctor issues
            them.
          </p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        /* No search results */
        <div className="prescription-message-card">
          <Search size={32} className="text-muted mb-3" />
          <h5>No Matching Prescriptions</h5>
          <p>Try searching with another doctor or medicine name.</p>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setPrescriptionSearch('')}
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Prescription cards */
        <div className="prescription-records">
          {filteredPrescriptions.map((prescription) => (
            <div className="prescription-record-card" key={prescription._id}>
              {/* Card header */}
              <div className="prescription-record-header">
                <div className="prescription-record-title">
                  <div className="prescription-document-icon">
                    <FileText size={23} />
                  </div>

                  <div>
                    <h5>Medical Prescription</h5>
                    <span>
                      {prescription.appointment?.appointmentDate
                        ? formatDate(
                            prescription.appointment.appointmentDate
                          )
                        : 'Appointment date not available'}
                    </span>
                  </div>
                </div>

                <span className="prescription-record-badge">
                  <CheckCircle size={14} />
                  Issued
                </span>
              </div>

              {/* Doctor details */}
              <div className="prescription-doctor-section">
                <div className="prescription-doctor-avatar">
                  <Stethoscope size={21} />
                </div>

                <div>
                  <small>Prescribed by</small>
                  <h6>
                    Dr. {prescription.doctor?.user?.name || 'Doctor'}
                  </h6>
                </div>
              </div>

              {/* Medicines */}
              <div className="prescription-medicine-section">
                <div className="prescription-section-heading">
                  <Pill size={19} />
                  <h6>Prescribed Medicines</h6>
                  <span>
                    {prescription.medicines?.length || 0} item(s)
                  </span>
                </div>

                {prescription.medicines?.length > 0 ? (
                  <div className="prescription-medicine-list">
                    {prescription.medicines.map((medicine, index) => (
                      <div
                        className="prescription-medicine-item"
                        key={index}
                      >
                        <div className="medicine-number">
                          {index + 1}
                        </div>

                        <div className="medicine-information">
                          <h6>{medicine.name || 'Medicine'}</h6>
                          <p>
                            {medicine.dosage || 'Dosage not specified'}
                          </p>
                        </div>

                        <Pill
                          size={19}
                          className="medicine-item-icon"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">
                    No medicines listed in this prescription.
                  </p>
                )}
              </div>

              {/* Doctor's notes */}
              <div className="prescription-notes-section">
                <div className="prescription-section-heading">
                  <ClipboardList size={19} />
                  <h6>Doctor's Instructions</h6>
                </div>

                <p>
                  {prescription.notes || 'No additional instructions provided.'}
                </p>
              </div>

              {/* Follow-up */}
              <div className="prescription-followup">
                <div className="prescription-followup-icon">
                  <CalendarClock size={20} />
                </div>

                <div>
                  <small>Follow-up Date</small>
                  <h6>
                    {prescription.followUpDate
                      ? formatDate(prescription.followUpDate)
                      : 'Not specified'}
                  </h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  // Find doctors view
  const renderFindDoctors = () => (
    <>
      <h2>Find Doctors</h2>
      <p className="text-muted">
        Choose a specialization and find the right doctor for your needs.
      </p>

      <h5 className="mt-4 mb-3">Medical Specializations</h5>

      {loadingSpecializations ? (
        <p>Loading specializations...</p>
      ) : specializations.length === 0 ? (
        <p className="text-muted">No active specializations found.</p>
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-md-4 col-lg-3">
            <button
              className={`specialization-card ${
                selectedSpecialization === '' ? 'selected' : ''
              }`}
              onClick={() => setSelectedSpecialization('')}
            >
              <Stethoscope size={25} />
              <span>All Doctors</span>
            </button>
          </div>

          {specializations.map((item) => (
            <div className="col-md-4 col-lg-3" key={item._id}>
              <button
                className={`specialization-card ${
                  selectedSpecialization === item._id ? 'selected' : ''
                }`}
                onClick={() => setSelectedSpecialization(item._id)}
              >
                <HeartPulse size={25} />
                <span>{item.name}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">Available Doctors</h5>
        <span className="text-muted small">
          {doctors.length} doctor(s)
        </span>
      </div>

      {loadingDoctors ? (
        <p>Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <div className="card p-4 text-center">
          <Search size={35} className="mx-auto mb-2 text-muted" />
          <p className="mb-0 text-muted">
            No doctors found for this specialization.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {doctors.map((doctor) => (
            <div className="col-md-6 col-xl-4" key={doctor._id}>
              <div className="card doctor-card p-3 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {doctor.user?.profileImage ? (
                    <img
                      src={doctor.user.profileImage}
                      alt={doctor.user.name}
                      className="doctor-avatar"
                    />
                  ) : (
                    <div className="doctor-avatar doctor-avatar-fallback">
                      {doctor.user?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                  )}

                  <div>
                    <h6 className="mb-1">
                      Dr. {doctor.user?.name || 'Doctor'}
                    </h6>
                    <small className="text-muted">
                      {doctor.specialization?.name || 'Specialist'}
                    </small>
                  </div>
                </div>

                <p className="small text-muted mb-2">
                  {doctor.experience} years of experience
                </p>

                <p className="small mb-2">
                  {doctor.bio || 'No biography available.'}
                </p>

                <p className="small mb-3">
                  Consultation Fee: ₹{doctor.consultationFee}
                </p>

                <span className="badge bg-success mb-3 align-self-start">
                  Available
                </span>

                <button
                  className="btn btn-primary-custom mt-auto"
                  onClick={() => handleViewDoctor(doctor)}
                >
                  View Doctor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="patient-layout">
      <aside className={`patient-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <HeartPulse size={30} />
          <span>MediCare</span>
        </div>

        <p className="sidebar-label">MENU</p>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`sidebar-link ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => handlePageChange(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button className="sidebar-link logout-link" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="patient-main">
        <header className="patient-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div>
            <h5>Patient Portal</h5>
            <small>Welcome to MediCare</small>
          </div>

          <div className="patient-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <span>{user?.name || 'Patient'}</span>
          </div>
        </header>

        <section className="patient-content">
        {activePage === 'Find Doctors' ? (
  selectedDoctor ? renderDoctorProfile() : renderFindDoctors()
) : activePage === 'My Appointments' ? (
  renderMyAppointments()
) : activePage === 'Prescriptions' ? (
  renderPrescriptions()
) : (
            <>
              <h2>{activePage}</h2>
              <p className="text-muted">
                Welcome back, {user?.name || 'Patient'}!
              </p>

              <div className="card p-4 mt-4">
                <h5>{activePage}</h5>
                <p className="text-muted mb-0">
                  This section will be implemented next.
                </p>
              </div>
            </>
          )}

          {success && (
            <div className="alert alert-success mt-3">
              <CheckCircle size={18} className="me-2" />
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;
