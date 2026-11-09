
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Stethoscope,
  CalendarCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Activity,
  Users,
  Award,
  Search,
  Menu,
  MapPin,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import "./Home.css";

function Home() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [specializationRes, doctorRes] = await Promise.all([
          api.get("/specializations/public"),
          api.get("/doctors/public"),
        ]);

        setSpecializations(specializationRes.data.specializations || []);
        setDoctors(doctorRes.data.doctors || []);
      } catch (error) {
        console.error("Homepage data error:", error);
        setLoadError("Unable to load doctors and specialities right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const filteredSpecializations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return specializations;

    return specializations.filter((item) =>
      `${item.name} ${item.description || ""}`.toLowerCase().includes(search)
    );
  }, [specializations, searchTerm]);

  const filteredDoctors = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return doctors;

    return doctors.filter((doctor) =>
      `${doctor.user?.name || ""} ${doctor.specialization?.name || ""} ${
        doctor.bio || ""
      }`.toLowerCase().includes(search)
    );
  }, [doctors, searchTerm]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="medicare-home">
      {/* Top header */}
      <div className="medicare-topbar">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <HeartPulse size={16} />
            <span>Healthcare access made simpler</span>
          </div>
          <div className="d-none d-md-flex align-items-center gap-4">
            <span><Clock size={15} /> Online appointment booking</span>
            <span><ShieldCheck size={15} /> Patient-focused care</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="navbar navbar-expand-lg medicare-navbar">
        <div className="container">
          <Link className="navbar-brand medicare-brand" to="/">
            <span className="brand-icon"><HeartPulse size={29} /></span>
            MediCare<span className="brand-dot">.</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav mx-auto gap-lg-3">
              <li className="nav-item">
                <a className="nav-link active" href="#home">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">About Us</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#specializations">Specialities</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#doctors">Doctors</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
            </ul>

            <div className="d-flex flex-wrap gap-2 nav-actions">
              <Link to="/login" className="btn btn-outline-medicare">
                Patient Login
              </Link>
              <Link to="/login" className="btn btn-medicare">
                Book Appointment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" id="home">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <span className="hero-label">
                <HeartPulse size={17} />
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1>
                Healthcare that
                <br />
                <span>puts you first.</span>
              </h1>

              <p className="hero-description">
                Discover medical specialities, connect with healthcare
                professionals and manage your appointments through one
                convenient platform.
              </p>

              <div className="hero-search mt-4">
                <Search size={19} />
                <input
                  type="search"
                  value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors or specialities..."
                  aria-label="Search doctors or specialities"
                />
                <button
                  type="button"
                  onClick={() => scrollToSection("specializations")}
                >
                  Search
                </button>
              </div>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/login" className="btn btn-medicare btn-lg">
                  Book an Appointment <ArrowRight size={18} />
                </Link>
                <a
                  href="#specializations"
                  className="btn btn-outline-medicare btn-lg"
                >
                  Explore Specialities
                </a>
              </div>

              <div className="hero-trust mt-4">
                <div><ShieldCheck size={18} /> Patient-focused platform</div>
                <div><CalendarCheck size={18} /> Convenient scheduling</div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-visual">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1000"
                  alt="Healthcare professional"
                  className="hero-image"
                />

                <div className="hero-info-card">
                  <div className="hero-info-icon">
                    <CalendarCheck size={25} />
                  </div>
                  <div>
                    <strong>Your healthcare, organised.</strong>
                    <p>Explore doctors and available appointment dates.</p>
                  </div>
                </div>

                <div className="hero-data-panel">
                  <div className="hero-panel-heading">
                    <Activity size={19} />
                    <span>Explore MediCare</span>
                  </div>
                  <div className="hero-panel-stats">
                    <div>
                      <strong>{loading ? "—" : specializations.length}</strong>
                      <span>Specialities</span>
                    </div>
                    <div>
                      <strong>{loading ? "—" : doctors.length}</strong>
                      <span>Available doctors</span>
                    </div>
                  </div>
                  <Link to="/login">
                    Get started <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights-section">
        <div className="container">
          <div className="row g-3">
            {[
              {
                icon: Stethoscope,
                title: "Doctor Profiles",
                text: "Explore doctors and their experience",
              },
              {
                icon: CalendarCheck,
                title: "Easy Booking",
                text: "Schedule appointments online",
              },
              {
                icon: ShieldCheck,
                title: "Patient Portal",
                text: "Access your appointment details",
              },
              {
                icon: HeartPulse,
                title: "Patient First",
                text: "A convenient healthcare experience",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="col-6 col-lg-3" key={item.title}>
                  <div className="highlight-card">
                    <Icon size={27} />
                    <h5>{item.title}</h5>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-padding" id="about">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <span className="section-label">ABOUT MEDICARE</span>
              <h2 className="section-heading">
                Healthcare designed around you.
              </h2>
              <p className="section-description">
                MediCare brings patients and healthcare professionals
                together through a simple digital platform. Browse
                specialities, view doctor profiles, book appointments and
                keep track of your healthcare journey.
              </p>
              <Link to="/login" className="text-medicare-link">
                Get started <ArrowRight size={17} />
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="about-card">
                <Activity size={39} />
                <h3>Care made more convenient</h3>
                <p>
                  Find the information you need, choose an available doctor
                  and manage your appointments in one place.
                </p>
                <div className="about-card-points">
                  <span><CheckCircleIcon /> Browse medical specialities</span>
                  <span><CheckCircleIcon /> View doctor availability</span>
                  <span><CheckCircleIcon /> Manage appointment history</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialities */}
      <section
        className="section-padding bg-light-medicare"
        id="specializations"
      >
        <div className="container">
          <div className="section-topline">
            <div>
              <span className="section-label">OUR SPECIALITIES</span>
              <h2 className="section-heading">
                Explore Medical Specialities
              </h2>
              <p className="section-description">
                Find a speciality and explore the doctors available.
              </p>
            </div>
            <Link to="/login" className="text-medicare-link">
              Patient Login <ArrowRight size={16} />
            </Link>
          </div>

          {loadError && <p className="home-error">{loadError}</p>}

          <div className="row g-4 mt-2">
            {loading ? (
              <div className="col-12 text-center py-4">
                Loading specialities...
              </div>
            ) : filteredSpecializations.length > 0 ? (
              filteredSpecializations.map((item) => (
                <div className="col-6 col-md-4 col-lg-3" key={item._id}>
                  <div className="specialty-card">
                    <div className="specialty-icon">
                      <HeartPulse size={27} />
                    </div>
                    <h5>{item.name}</h5>
                    <p>{item.description || "Specialized medical care"}</p>
                    <Link to="/login">
                      Explore doctors <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">
                No matching specialities found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section-padding" id="doctors">
        <div className="container">
          <div className="section-topline">
            <div>
              <span className="section-label">OUR MEDICAL TEAM</span>
              <h2 className="section-heading">Meet Our Doctors</h2>
              <p className="section-description">
                Explore the profiles of our available healthcare professionals.
              </p>
            </div>
            <Link to="/login" className="text-medicare-link">
              Book appointment <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4 mt-2">
            {loading ? (
              <div className="col-12 text-center py-4">Loading doctors...</div>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.slice(0, 4).map((doctor) => (
                <div className="col-sm-6 col-lg-3" key={doctor._id}>
                  <div className="doctor-card">
                    <div className="doctor-photo">
                      {doctor.user?.profileImage ? (
                        <img
                          src={doctor.user.profileImage}
                          alt={doctor.user?.name || "Doctor"}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Stethoscope size={45} />
                      )}
                    </div>
                    <div className="doctor-details">
                      <span className="doctor-speciality">
                        {doctor.specialization?.name || "Medical Specialist"}
                      </span>
                      <h5>{doctor.user?.name || "Doctor"}</h5>
                      <p>
                        <Award size={15} />
                        {doctor.experience ?? 0} years experience
                      </p>
                      <Link to="/login" className="doctor-link">
                        Book Appointment <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4">
                No matching doctors found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why MediCare */}
      <section className="why-section section-padding">
        <div className="container">
          <div className="text-center section-intro">
            <span className="section-label">WHY MEDICARE</span>
            <h2 className="section-heading">Healthcare made simpler</h2>
          </div>

          <div className="row g-4 mt-3">
            {[
              {
                icon: Users,
                title: "Patient Focused",
                text: "Access your appointments and healthcare information through your patient account.",
              },
              {
                icon: Award,
                title: "Doctor Information",
                text: "Explore doctor profiles, specialities and professional experience.",
              },
              {
                icon: CalendarCheck,
                title: "Convenient Scheduling",
                text: "View available dates and request appointments online.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="col-md-4" key={item.title}>
                  <div className="why-card">
                    <Icon size={32} />
                    <h5>{item.title}</h5>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container text-center">
          <span className="cta-eyebrow">YOUR HEALTHCARE JOURNEY STARTS HERE</span>
          <h2>Take the next step towards better care.</h2>
          <p>
            Sign in to explore doctors and schedule your appointment.
          </p>
          <Link to="/login" className="btn btn-light btn-lg">
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="medicare-footer" id="contact">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5">
              <Link className="footer-brand" to="/">
                <HeartPulse size={26} /> MediCare.
              </Link>
              <p>
                Making healthcare access simpler through convenient
                digital services and patient-focused care.
              </p>
            </div>

            <div className="col-6 col-lg-3">
              <h6>Explore</h6>
              <a href="#about">About Us</a>
              <a href="#specializations">Specialities</a>
              <a href="#doctors">Our Doctors</a>
            </div>

            <div className="col-6 col-lg-4">
              <h6>Patient Services</h6>
              <Link to="/login">Patient Login</Link>
              <Link to="/login">Book Appointment</Link>
              <Link to="/login">Appointment History</Link>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} MediCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckCircleIcon() {
  return <ShieldCheck size={17} />;
}

export default Home;
