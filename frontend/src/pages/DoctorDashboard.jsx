
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  FilePlus,
  UserRound,
  LogOut,
  Menu,
  X,
  Stethoscope,
  RefreshCw
} from 'lucide-react';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
const [searchPatient, setSearchPatient] = useState('');
const [filterDate, setFilterDate] = useState('');
const [updatingAppointment, setUpdatingAppointment] = useState('');
const [availability, setAvailability] = useState([]);
const [selectedDates, setSelectedDates] = useState([]);
const [dateInput, setDateInput] = useState('');
const [availabilityLoading, setAvailabilityLoading] = useState(false);
const [availabilityMessage, setAvailabilityMessage] = useState('');
const [availabilityError, setAvailabilityError] = useState('');
const [selectedAppointment, setSelectedAppointment] = useState('');
const [medicines, setMedicines] = useState([
  { name: '', dosage: '' }
]);
const [prescriptionNotes, setPrescriptionNotes] = useState('');
const [followUpDate, setFollowUpDate] = useState('');
const [prescriptionLoading, setPrescriptionLoading] = useState(false);
const [prescriptionMessage, setPrescriptionMessage] = useState('');
const [prescriptionError, setPrescriptionError] = useState('');

const [profile, setProfile] = useState({
  name: '',
  phone: '',
  profileImage: '',
  bio: ''
});

const [profileLoading, setProfileLoading] = useState(false);
const [profileSaving, setProfileSaving] = useState(false);
const [profileMessage, setProfileMessage] = useState('');
const [profileError, setProfileError] = useState('');

const updateStatus = async (appointmentId, status) => {
  try {
    setUpdatingAppointment(appointmentId);

    await api.patch(`/appointments/${appointmentId}/status`, {
      status,
    });

    await fetchAppointments();
  } catch (error) {
    alert(
      error.response?.data?.message ||
      'Unable to update appointment status.'
    );
  } finally {
    setUpdatingAppointment('');
  }
};
  // FETCH DOCTOR APPOINTMENTS
  const fetchAppointments = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError('');

      const response = await api.get('/appointments/doctor');

      setAppointments(response.data.appointments || []);
    } catch (error) {
      setDashboardError(
        error.response?.data?.message ||
        'Unable to load appointments.'
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);
  useEffect(() => {
  if (activeSection === 'My Profile') {
    fetchDoctorProfile();
  }
}, [activeSection]);
const fetchAvailability = async () => {
  try {
    setAvailabilityLoading(true);
    setAvailabilityError('');

    const response = await api.get('/availability/my');
    setAvailability(response.data.availability || []);
  } catch (error) {
    setAvailabilityError(
      error.response?.data?.message || 'Unable to load availability.'
    );
  } finally {
    setAvailabilityLoading(false);
  }
};

const addDateToSelection = () => {
  if (!dateInput) {
    setAvailabilityError('Please select a date.');
    return;
  }

  if (selectedDates.includes(dateInput)) {
    setAvailabilityError('This date is already selected.');
    return;
  }

  setSelectedDates(prev => [...prev, dateInput].sort());
  setDateInput('');
  setAvailabilityError('');
};

const removeSelectedDate = (date) => {
  setSelectedDates(prev => prev.filter(item => item !== date));
};

const saveAvailability = async () => {
  if (selectedDates.length === 0) {
    setAvailabilityError('Please select at least one date.');
    return;
  }

  try {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    setAvailabilityMessage('');

    const response = await api.post('/availability', {
      dates: selectedDates
    });

    setAvailabilityMessage(response.data.message);
    setSelectedDates([]);
    await fetchAvailability();
  } catch (error) {
    setAvailabilityError(
      error.response?.data?.message || 'Unable to save availability.'
    );
  } finally {
    setAvailabilityLoading(false);
  }
};
useEffect(() => {
  if (activeSection === 'Availability') {
    fetchAvailability();
  }
}, [activeSection]);
const addMedicine = () => {
  setMedicines(prev => [...prev, { name: '', dosage: '' }]);
};

const removeMedicine = (index) => {
  setMedicines(prev => prev.filter((_, i) => i !== index));
};

const updateMedicine = (index, field, value) => {
  setMedicines(prev =>
    prev.map((medicine, i) =>
      i === index ? { ...medicine, [field]: value } : medicine
    )
  );
};

const submitPrescription = async () => {
  if (!selectedAppointment) {
    setPrescriptionError('Please select an appointment.');
    return;
  }

  if (medicines.some(m => !m.name.trim() || !m.dosage.trim())) {
    setPrescriptionError('Enter both medicine name and dosage.');
    return;
  }

  try {
    setPrescriptionLoading(true);
    setPrescriptionError('');
    setPrescriptionMessage('');

    const response = await api.post('/prescriptions', {
      appointmentId: selectedAppointment,
      medicines,
      notes: prescriptionNotes,
      followUpDate: followUpDate || null
    });

    setPrescriptionMessage(
      response.data.message || 'Prescription created successfully.'
    );

    setSelectedAppointment('');
    setMedicines([{ name: '', dosage: '' }]);
    setPrescriptionNotes('');
    setFollowUpDate('');
  } catch (error) {
    setPrescriptionError(
      error.response?.data?.message || 'Unable to create prescription.'
    );
  } finally {
    setPrescriptionLoading(false);
  }
};
const fetchDoctorProfile = async () => {
  try {
    setProfileLoading(true);
    setProfileError('');

    const response = await api.get('/doctors/profile/me');

    setProfile(response.data.profile);
  } catch (error) {
    setProfileError(
      error.response?.data?.message || 'Unable to load profile.'
    );
  } finally {
    setProfileLoading(false);
  }
};
const handleProfileChange = (field, value) => {
  setProfile(prev => ({
    ...prev,
    [field]: value
  }));
};

const saveDoctorProfile = async () => {
  try {
    setProfileSaving(true);
    setProfileError('');
    setProfileMessage('');

    const response = await api.put('/doctors/profile/me', profile);

    setProfile(prev => ({
      ...prev,
      ...response.data.profile
    }));

    setProfileMessage(
      response.data.message || 'Profile updated successfully.'
    );
  } catch (error) {
    setProfileError(
      error.response?.data?.message || 'Unable to update profile.'
    );
  } finally {
    setProfileSaving(false);
  }
};

  // DATE HELPERS
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  const getDateString = (date) =>
    new Date(date).toISOString().slice(0, 10);

  // APPOINTMENT STATISTICS
  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (item) => item.status === 'pending'
  ).length;

  const confirmedAppointments = appointments.filter(
    (item) => item.status === 'confirmed'
  ).length;

  const completedAppointments = appointments.filter(
    (item) => item.status === 'completed'
  ).length;

  const upcomingAppointments = appointments
    .filter((item) => {
      const appointmentDate = getDateString(item.appointmentDate);

      return (
        appointmentDate >= todayString &&
        ['pending', 'confirmed'].includes(item.status)
      );
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );

  // SIDEBAR MENU
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', icon: CalendarDays },
    { name: 'Availability', icon: CalendarCheck },
    { name: 'Prescriptions', icon: FilePlus },
    { name: 'My Profile', icon: UserRound }
  ];

  // DASHBOARD CONTENT
  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return (
          <>
            <div className="mb-4">
              <h2>Welcome, Dr. {user?.name}!</h2>
              <p>Here's your medical practice overview.</p>
            </div>

            {dashboardLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" />
                <p className="mt-2">Loading dashboard...</p>
              </div>
            ) : dashboardError ? (
              <div className="alert alert-danger">
                {dashboardError}
                <button
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={fetchAppointments}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* STATISTICS */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-lg-3">
                    <div className="card doctor-stat-card">
                      <span>Total Appointments</span>
                      <h3>{totalAppointments}</h3>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="card doctor-stat-card">
                      <span>Pending</span>
                      <h3>{pendingAppointments}</h3>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="card doctor-stat-card">
                      <span>Confirmed</span>
                      <h3>{confirmedAppointments}</h3>
                    </div>
                  </div>

                  <div className="col-6 col-lg-3">
                    <div className="card doctor-stat-card">
                      <span>Completed</span>
                      <h3>{completedAppointments}</h3>
                    </div>
                  </div>
                </div>

                {/* UPCOMING APPOINTMENTS */}
                <div className="card p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-1">
                        Upcoming Appointments
                      </h5>
                      <small className="text-muted">
                        Your scheduled patient visits
                      </small>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={fetchAppointments}
                      title="Refresh appointments"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </div>

                  {upcomingAppointments.length === 0 ? (
                    <p className="text-muted mb-0 py-3">
                      No upcoming appointments.
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Email</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {upcomingAppointments.map((item) => (
                            <tr key={item._id}>
                              <td className="fw-semibold">
                                {item.patient?.name || 'Unknown'}
                              </td>

                              <td>
                                {new Date(
                                  item.appointmentDate
                                ).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'UTC'
                                })}
                              </td>

                              <td>
                                {item.patient?.email || '-'}
                              </td>

                              <td>
                                <span
                                  className={`badge ${
                                    item.status === 'confirmed'
                                      ? 'bg-success'
                                      : 'bg-warning text-dark'
                                  }`}
                                >
                                  {item.status}
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
          </>
        );

      case 'My Appointments': {
  const filteredAppointments = appointments.filter((item) => {
    const patientName = item.patient?.name || '';

    const matchesName = patientName
      .toLowerCase()
      .includes(searchPatient.toLowerCase());

    const matchesDate = !filterDate ||
      getDateString(item.appointmentDate) === filterDate;

    return matchesName && matchesDate;
  });

  return (
    <>
      <div className="mb-4">
        <h2>My Appointments</h2>
        <p>View and manage your patient appointments.</p>
      </div>

      <div className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Search Patient</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter patient name"
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchPatient('');
                setFilterDate('');
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {dashboardLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-info" />
        </div>
      ) : dashboardError ? (
        <div className="alert alert-danger">
          {dashboardError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchAppointments}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="card p-3">
          <div className="d-flex justify-content-between mb-3">
            <h5>Appointment List</h5>
            <span className="text-muted">
              {filteredAppointments.length} appointments
            </span>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="text-muted py-3">
              No appointments found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-semibold">
                        {item.patient?.name || 'Unknown'}
                      </td>

                      <td>
                        <div>{item.patient?.email || '-'}</div>
                        <small className="text-muted">
                          {item.patient?.phone || ''}
                        </small>
                      </td>

                      <td>
                        {new Date(item.appointmentDate)
                          .toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })}
                      </td>

                      <td>
                        <span className={`badge ${
                          item.status === 'confirmed'
                            ? 'bg-success'
                            : item.status === 'completed'
                              ? 'bg-primary'
                              : item.status === 'cancelled'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {updatingAppointment === item._id ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <div className="d-flex gap-2 flex-wrap">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    updateStatus(item._id, 'confirmed')
                                  }
                                >
                                  Confirm
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    updateStatus(item._id, 'cancelled')
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {item.status === 'confirmed' && (
                              <>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() =>
                                    updateStatus(item._id, 'completed')
                                  }
                                >
                                  Complete
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    updateStatus(item._id, 'cancelled')
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {['completed', 'cancelled'].includes(item.status) && (
                              <span className="text-muted small">
                                No actions available
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

      case 'Availability':
  return (
    <div>
      <h2 className="page-title">Manage Availability</h2>
      <p className="page-subtitle">
        Select the dates when you are available for appointments.
      </p>

      <div className="card p-4 mb-4">
        <h5 className="mb-3">Add Available Dates</h5>

        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toLocaleDateString('en-CA', {
                timeZone: 'Asia/Kolkata'
              })}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-outline-primary w-100"
              onClick={addDateToSelection}
              type="button"
            >
              Add Date
            </button>
          </div>
        </div>

        {selectedDates.length > 0 && (
          <div className="mt-3">
            <h6>Selected Dates</h6>

            <div className="d-flex flex-wrap gap-2">
              {selectedDates.map(date => (
                <span
                  key={date}
                  className="badge bg-light text-dark border p-2"
                >
                  {date}
                  <button
                    type="button"
                    className="btn-close ms-2"
                    style={{ fontSize: '9px' }}
                    onClick={() => removeSelectedDate(date)}
                    aria-label={`Remove ${date}`}
                  />
                </span>
              ))}
            </div>

            <button
              className="btn btn-primary-custom mt-3"
              onClick={saveAvailability}
              disabled={availabilityLoading}
            >
              {availabilityLoading ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        )}

        {availabilityError && (
          <div className="alert alert-danger mt-3 mb-0">
            {availabilityError}
          </div>
        )}

        {availabilityMessage && (
          <div className="alert alert-success mt-3 mb-0">
            {availabilityMessage}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h5 className="mb-3">My Available Dates</h5>

        {availabilityLoading && <p>Loading availability...</p>}

        {!availabilityLoading && availability.length === 0 && (
          <p className="text-muted mb-0">
            No available dates added yet.
          </p>
        )}

        {!availabilityLoading && availability.length > 0 && (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Available Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {availability.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'Asia/Kolkata'
                      })}
                    </td>
                    <td>
                      <span className="badge bg-success">
                        Available
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

case 'Prescriptions': {
  const completedAppointments = appointments.filter(
    item => item.status === 'completed'
  );

  return (
    <div>
      <h2 className="page-title">Prescriptions</h2>
      <p className="page-subtitle">
        Create prescriptions for your completed appointments.
      </p>

      <div className="card p-4">
        <h5 className="mb-3">Create New Prescription</h5>

        <div className="mb-4">
          <label className="form-label">Select Completed Appointment</label>

          <select
            className="form-select"
            value={selectedAppointment}
            onChange={e => setSelectedAppointment(e.target.value)}
          >
            <option value="">Choose an appointment</option>

            {completedAppointments.map(item => (
              <option key={item._id} value={item._id}>
                {item.patient?.name || 'Patient'} — {
                  new Date(item.appointmentDate).toLocaleDateString('en-IN')
                }
              </option>
            ))}
          </select>

          {completedAppointments.length === 0 && (
            <small className="text-muted">
              No completed appointments available.
            </small>
          )}
        </div>

        <h6 className="mb-3">Medicines</h6>

        {medicines.map((medicine, index) => (
          <div className="row g-2 mb-3" key={index}>
            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Medicine name"
                value={medicine.name}
                onChange={e =>
                  updateMedicine(index, 'name', e.target.value)
                }
              />
            </div>

            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Dosage"
                value={medicine.dosage}
                onChange={e =>
                  updateMedicine(index, 'dosage', e.target.value)
                }
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => removeMedicine(index)}
                disabled={medicines.length === 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="mb-4">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={addMedicine}
          >
            + Add Medicine
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Additional instructions..."
            value={prescriptionNotes}
            onChange={e => setPrescriptionNotes(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Follow-up Date</label>
          <input
            type="date"
            className="form-control"
            min={new Date().toLocaleDateString('en-CA', {
              timeZone: 'Asia/Kolkata'
            })}
            value={followUpDate}
            onChange={e => setFollowUpDate(e.target.value)}
          />
        </div>

        {prescriptionError && (
          <div className="alert alert-danger">
            {prescriptionError}
          </div>
        )}

        {prescriptionMessage && (
          <div className="alert alert-success">
            {prescriptionMessage}
          </div>
        )}

        <button
          className="btn btn-primary-custom"
          onClick={submitPrescription}
          disabled={prescriptionLoading || completedAppointments.length === 0}
        >
          {prescriptionLoading ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </div>
  );
}

     case 'My Profile':
  return (
    <div>
      <h2 className="page-title">My Profile</h2>
      <p className="page-subtitle">
        View and update your professional information.
      </p>

      <div className="card p-4">
        {profileLoading ? (
          <p>Loading profile...</p>
        ) : (
          <>
            <div className="text-center mb-4">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Doctor profile"
                  className="rounded-circle"
                  style={{
                    width: '110px',
                    height: '110px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  className="rounded-circle bg-light mx-auto d-flex align-items-center justify-content-center"
                  style={{ width: '110px', height: '110px' }}
                >
                  <UserRound size={45} />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                value={profile.name}
                onChange={e =>
                  handleProfileChange('name', e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                value={profile.phone}
                onChange={e =>
                  handleProfileChange('phone', e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Profile Image URL</label>
              <input
                className="form-control"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={profile.profileImage}
                onChange={e =>
                  handleProfileChange('profileImage', e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Professional Bio</label>
              <textarea
                className="form-control"
                rows="4"
                value={profile.bio}
                onChange={e =>
                  handleProfileChange('bio', e.target.value)
                }
              />
            </div>

            {profileError && (
              <div className="alert alert-danger">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="alert alert-success">
                {profileMessage}
              </div>
            )}

            <button
              className="btn btn-primary-custom"
              onClick={saveDoctorProfile}
              disabled={profileSaving}
            >
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="doctor-layout">

      {/* SIDEBAR */}
      <aside className={`doctor-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="doctor-brand">
          <Stethoscope size={27} />
          <span>MediCare</span>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>

        <div className="doctor-sidebar-label">
          DOCTOR PORTAL
        </div>

        <nav className="doctor-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`doctor-nav-item ${
                  activeSection === item.name ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveSection(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button className="doctor-logout" onClick={logout}>
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="doctor-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="doctor-main">

        <header className="doctor-header">
          <button
            className="doctor-menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <h5>Doctor Portal</h5>
            <small>
              Manage your appointments and patients
            </small>
          </div>

          <div className="doctor-header-user">
            <div className="doctor-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span>{user?.name}</span>
          </div>
        </header>

        <section className="doctor-content">
          {renderContent()}
        </section>

      </main>
    </div>
  );
}

export default DoctorDashboard;
