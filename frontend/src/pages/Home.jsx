
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Stethoscope,
  CalendarCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Menu,
  Activity,
  Users,
  Award,
} from "lucide-react";
import api from "../services/api";
import "./Home.css";

function Home() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [specializationRes, doctorRes] = await Promise.all([
          api.get("/specializations/public"),
          api.get("/doctors/public"),
        ]);

        setSpecializations(
          specializationRes.data.specializations || []
        );

        setDoctors(
          doctorRes.data.doctors || []
        );
      } catch (error) {
        console.error("Homepage data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="medicare-home">

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg medicare-navbar">
        <div className="container">
          <Link className="navbar-brand medicare-brand" to="/">
            <span className="brand-icon">
              <HeartPulse size={27} />
            </span>
            MediCare<span className="brand-dot">.</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
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
                <a className="nav-link" href="#doctors">Our Doctors</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-medicare">
                Login
              </Link>
              <Link to="/login" className="btn btn-medicare">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" id="home">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="hero-label">
                <HeartPulse size={16} />
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1>
                Caring for You.
                <br />
                <span>Every Step of the Way.</span>
              </h1>

              <p className="hero-description">
                Experience quality healthcare with experienced
                doctors, personalized attention and convenient
                online appointment booking.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/login" className="btn btn-medicare btn-lg">
                  Book an Appointment
                  <ArrowRight size={18} />
                </Link>

                <a href="#specializations" className="btn btn-outline-medicare btn-lg">
                  Explore Specialities
                </a>
              </div>

              <div className="hero-trust mt-5">
                <div>
                  <ShieldCheck />
                  <span>Trusted Healthcare</span>
                </div>
                <div>
                  <Clock />
                  <span>Easy Online Booking</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1000"
                  alt="Healthcare professional"
                  className="hero-image"
                />

                <div className="hero-floating-card">
                  <div className="floating-icon">
                    <CalendarCheck />
                  </div>
                  <div>
                    <strong>Easy Appointments</strong>
                    <p>Book your visit online</p>
                  </div>
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
              { icon: Stethoscope, title: "Expert Doctors", text: "Qualified medical professionals" },
              { icon: CalendarCheck, title: "Easy Booking", text: "Convenient appointment scheduling" },
              { icon: ShieldCheck, title: "Patient First", text: "Care focused on your needs" },
              { icon: HeartPulse, title: "Quality Care", text: "Healthcare you can trust" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="col-6 col-lg-3" key={index}>
                  <div className="highlight-card">
                    <Icon size={28} />
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
                MediCare makes accessing healthcare simpler.
                Discover medical specialities, explore doctor
                profiles, schedule appointments and keep track
                of your healthcare journey in one place.
              </p>

              <Link to="/login" className="text-medicare-link">
                Get started <ArrowRight size={17} />
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="about-card">
                <Activity size={38} />
                <h3>Care that puts patients first</h3>
                <p>
                  A convenient digital experience connecting
                  patients with healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="section-padding bg-light-medicare" id="specializations">
        <div className="container">
          <div className="text-center section-intro">
            <span className="section-label">OUR SPECIALITIES</span>
            <h2 className="section-heading">Explore Our Medical Specialities</h2>
            <p className="section-description">
              Find the right medical speciality for your healthcare needs.
            </p>
          </div>

          <div className="row g-4 mt-3">
            {loading ? (
              <div className="col-12 text-center">Loading specialities...</div>
            ) : specializations.length > 0 ? (
              specializations.map((item) => (
                <div className="col-6 col-md-4 col-lg-3" key={item._id}>
                  <div className="specialty-card">
                    <div className="specialty-icon">
                      <HeartPulse size={27} />
                    </div>
                    <h5>{item.name}</h5>
                    <p>{item.description || "Specialized medical care"}</p>
                    <Link to="/login">
                      Explore <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                No specialities available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section-padding" id="doctors">
        <div className="container">
          <div className="text-center section-intro">
            <span className="section-label">OUR MEDICAL TEAM</span>
            <h2 className="section-heading">Meet Our Doctors</h2>
            <p className="section-description">
              Get to know our available healthcare professionals.
            </p>
          </div>

          <div className="row g-4 mt-3">
            {loading ? (
              <div className="col-12 text-center">Loading doctors...</div>
            ) : doctors.length > 0 ? (
              doctors.slice(0, 4).map((doctor) => (
                <div className="col-md-6 col-lg-3" key={doctor._id}>
                  <div className="doctor-card">
                    <div className="doctor-photo">
                      {doctor.user?.profileImage ? (
                        <img
                          src={doctor.user.profileImage}
                          alt={doctor.user?.name || "Doctor"}
                        />
                      ) : (
                        <Stethoscope size={45} />
                      )}
                    </div>
                    <div className="doctor-details">
                      <h5>{doctor.user?.name || "Doctor"}</h5>
                      <span>
                        {doctor.specialization?.name || "Medical Specialist"}
                      </span>
                      <p>{doctor.experience || 0} years experience</p>
                      <Link to="/login" className="doctor-link">
                        Book Appointment <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                No doctors are currently available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="why-section section-padding">
        <div className="container">
          <div className="text-center section-intro">
            <span className="section-label">WHY MEDICARE</span>
            <h2 className="section-heading">Healthcare made simpler</h2>
          </div>

          <div className="row g-4 mt-3">
            {[
              { icon: Users, title: "Patient Focused", text: "A convenient experience built around patient needs." },
              { icon: Award, title: "Qualified Professionals", text: "Explore doctor profiles and their experience." },
              { icon: CalendarCheck, title: "Convenient Scheduling", text: "View available dates and book appointments online." },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="col-md-4" key={index}>
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
          <h2>Your health deserves attention.</h2>
          <p>Take the first step towards convenient healthcare today.</p>
          <Link to="/login" className="btn btn-light btn-lg">
            Book Your Appointment <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="medicare-footer" id="contact">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5">
              <Link className="footer-brand" to="/">
                <HeartPulse size={25} /> MediCare.
              </Link>
              <p>
                Making healthcare more accessible through
                convenient digital services and patient-focused care.
              </p>
            </div>

            <div className="col-6 col-lg-3">
              <h6>Quick Links</h6>
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

export default Home;
