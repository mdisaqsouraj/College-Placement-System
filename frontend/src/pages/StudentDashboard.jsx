import React from "react";
import Card from "../components/Card";
import {
  User,
  Building2,
  BriefcaseBusiness,
  FileText,
  CheckCircle,
  CalendarDays,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function StudentDashboard() {
  // Dummy student data for UI development.
  const student = {
    name: "Rahul Sharma",
    rollNumber: "CS2024001",
    branch: "Computer Science",
    year: "3rd Year",
  };

  const stats = [
    {
      title: "Total Placement Drives",
      value: "24",
      icon: BriefcaseBusiness,
      description: "Available drives",
    },
    {
      title: "Eligible Drives",
      value: "12",
      icon: CheckCircle,
      description: "You can apply",
    },
    {
      title: "Applications Submitted",
      value: "8",
      icon: FileText,
      description: "Total applications",
    },
    {
      title: "Selected Applications",
      value: "2",
      icon: Building2,
      description: "Successfully selected",
    },
  ];

  const upcomingDrives = [
    {
      company: "TCS",
      role: "Software Developer",
      date: "15 October 2026",
      time: "10:00 AM",
      location: "College Auditorium",
    },
    {
      company: "Infosys",
      role: "Systems Engineer",
      date: "18 October 2026",
      time: "11:00 AM",
      location: "Seminar Hall",
    },
    {
      company: "Deloitte",
      role: "Technology Analyst",
      date: "22 October 2026",
      time: "2:00 PM",
      location: "Placement Cell",
    },
  ];

  const recentApplications = [
    {
      company: "TCS",
      role: "Software Developer",
      date: "05 October 2026",
      status: "Applied",
    },
    {
      company: "Infosys",
      role: "Systems Engineer",
      date: "03 October 2026",
      status: "Shortlisted",
    },
    {
      company: "Wipro",
      role: "Project Engineer",
      date: "30 September 2026",
      status: "Rejected",
    },
    {
      company: "Accenture",
      role: "Associate Software Engineer",
      date: "28 September 2026",
      status: "Selected",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "Selected") {
      return {
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    }

    if (status === "Shortlisted") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (status === "Rejected") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#b45309",
    };
  };

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <div>
            <p style={styles.welcomeText}>Welcome back,</p>

            <h1 style={styles.heading}>
              Hello, {student.name} 👋
            </h1>

            <p style={styles.subtitle}>
              Track your placement opportunities and applications from
              one place.
            </p>
          </div>

          <Link to="/student/profile" style={styles.profileButton}>
            <User size={18} />
            View Profile
          </Link>
        </section>

        {/* Student Profile Summary */}
        <Card
          title="Student Profile"
          description="Your basic academic information"
        >
          <div style={styles.profileGrid}>
            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Name</span>
              <span style={styles.profileValue}>{student.name}</span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Roll Number</span>
              <span style={styles.profileValue}>
                {student.rollNumber}
              </span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Branch</span>
              <span style={styles.profileValue}>{student.branch}</span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Year</span>
              <span style={styles.profileValue}>{student.year}</span>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <section style={styles.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    <Icon size={23} />
                  </div>

                  <div>
                    <p style={styles.statTitle}>{stat.title}</p>
                    <h2 style={styles.statValue}>{stat.value}</h2>
                    <p style={styles.statDescription}>
                      {stat.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        {/* Upcoming Drives */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Upcoming Placement Drives
              </h2>

              <p style={styles.sectionSubtitle}>
                Keep track of your upcoming opportunities.
              </p>
            </div>

            <Link to="/placement-drives" style={styles.viewAll}>
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={styles.drivesGrid}>
            {upcomingDrives.map((drive) => (
              <Card key={`${drive.company}-${drive.date}`}>
                <div>
                  <div style={styles.companyHeader}>
                    <div style={styles.companyIcon}>
                      <Building2 size={20} />
                    </div>

                    <div>
                      <h3 style={styles.companyName}>
                        {drive.company}
                      </h3>

                      <p style={styles.role}>{drive.role}</p>
                    </div>
                  </div>

                  <div style={styles.driveDetails}>
                    <div style={styles.detailItem}>
                      <CalendarDays size={16} />
                      <span>{drive.date}</span>
                    </div>

                    <div style={styles.detailItem}>
                      <Clock size={16} />
                      <span>{drive.time}</span>
                    </div>

                    <div style={styles.detailItem}>
                      <Building2 size={16} />
                      <span>{drive.location}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Applications */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Recent Applications
              </h2>

              <p style={styles.sectionSubtitle}>
                Your latest placement applications.
              </p>
            </div>

            <Link to="/applications" style={styles.viewAll}>
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <Card>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Company</th>
                    <th style={styles.tableHeader}>Role</th>
                    <th style={styles.tableHeader}>Applied On</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentApplications.map((application) => (
                    <tr
                      key={`${application.company}-${application.date}`}
                    >
                      <td style={styles.tableCell}>
                        <div style={styles.companyCell}>
                          <div style={styles.smallCompanyIcon}>
                            <Building2 size={16} />
                          </div>

                          <span>{application.company}</span>
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        {application.role}
                      </td>

                      <td style={styles.tableCell}>
                        {application.date}
                      </td>

                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(application.status),
                          }}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "30px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  welcomeSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
    padding: "28px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  welcomeText: {
    margin: "0 0 4px",
    fontSize: "14px",
    color: "#64748b",
  },

  heading: {
    margin: "0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
  },

  profileButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },

  profileItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  profileLabel: {
    fontSize: "12px",
    color: "#64748b",
  },

  profileValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    marginTop: "20px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  statIcon: {
    width: "46px",
    height: "46px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },

  statTitle: {
    margin: "0",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.4",
  },

  statValue: {
    margin: "2px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },

  statDescription: {
    margin: "0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  section: {
    marginTop: "30px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "14px",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  drivesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
  },

  companyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  companyIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    flexShrink: 0,
  },

  companyName: {
    margin: "0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
  },

  role: {
    margin: "3px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  driveDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    paddingTop: "15px",
    borderTop: "1px solid #f1f5f9",
  },

  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#64748b",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "650px",
    borderCollapse: "collapse",
  },

  tableHeader: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },

  tableCell: {
    padding: "14px",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
  },

  companyCell: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontWeight: "600",
    color: "#1e293b",
  },

  smallCompanyIcon: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },

  status: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
};

export default StudentDashboard;