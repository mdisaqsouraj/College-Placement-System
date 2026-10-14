import React from "react";
import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  Plus,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  GraduationCap,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  ClipboardList,
} from "lucide-react";
import Card from "../components/Card";

function AdminDashboard() {
  // Dummy data for dashboard UI
  const stats = [
    {
      title: "Total Students",
      value: "1,248",
      description: "Registered students",
      icon: Users,
      color: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "Total Companies",
      value: "86",
      description: "Registered companies",
      icon: Building2,
      color: "#7c3aed",
      background: "#f5f3ff",
    },
    {
      title: "Active Placement Drives",
      value: "24",
      description: "Currently active drives",
      icon: BriefcaseBusiness,
      color: "#059669",
      background: "#ecfdf5",
    },
    {
      title: "Total Applications",
      value: "2,856",
      description: "Student applications",
      icon: FileText,
      color: "#d97706",
      background: "#fffbeb",
    },
  ];

  const recentDrives = [
    {
      id: 1,
      company: "Tata Consultancy Services",
      role: "Software Engineer",
      package: "₹7.5 LPA",
      deadline: "15 Oct 2026",
      status: "Active",
    },
    {
      id: 2,
      company: "Infosys",
      role: "Systems Engineer",
      package: "₹6.5 LPA",
      deadline: "20 Oct 2026",
      status: "Active",
    },
    {
      id: 3,
      company: "Deloitte",
      role: "Technology Analyst",
      package: "₹8 LPA",
      deadline: "25 Oct 2026",
      status: "Active",
    },
    {
      id: 4,
      company: "Accenture",
      role: "Associate Software Engineer",
      package: "₹7.2 LPA",
      deadline: "05 Nov 2026",
      status: "Upcoming",
    },
  ];

  const recentApplications = [
    {
      id: 1,
      student: "Rahul Sharma",
      initials: "RS",
      company: "TCS",
      role: "Software Engineer",
      date: "10 Oct 2026",
      status: "Shortlisted",
    },
    {
      id: 2,
      student: "Priya Patil",
      initials: "PP",
      company: "Infosys",
      role: "Systems Engineer",
      date: "09 Oct 2026",
      status: "Applied",
    },
    {
      id: 3,
      student: "Amit Kumar",
      initials: "AK",
      company: "Deloitte",
      role: "Technology Analyst",
      date: "09 Oct 2026",
      status: "Selected",
    },
    {
      id: 4,
      student: "Sneha Joshi",
      initials: "SJ",
      company: "Wipro",
      role: "Project Engineer",
      date: "08 Oct 2026",
      status: "Rejected",
    },
    {
      id: 5,
      student: "Vikas Singh",
      initials: "VS",
      company: "Accenture",
      role: "Associate Software Engineer",
      date: "08 Oct 2026",
      status: "Applied",
    },
  ];

  const adminActions = [
    {
      title: "Add Company",
      description: "Register a new recruiting company",
      icon: Building2,
      color: "#2563eb",
      background: "#eff6ff",
      action: "add-company",
    },
    {
      title: "Add Placement Drive",
      description: "Create a new placement opportunity",
      icon: BriefcaseBusiness,
      color: "#059669",
      background: "#ecfdf5",
      action: "add-drive",
    },
    {
      title: "View Students",
      description: "Review registered student details",
      icon: Users,
      color: "#7c3aed",
      background: "#f5f3ff",
      action: "view-students",
    },
    {
      title: "View Applications",
      description: "Track student application statuses",
      icon: ClipboardList,
      color: "#d97706",
      background: "#fffbeb",
      action: "view-applications",
    },
  ];

  const handleAdminAction = (action) => {
    // Ready for future functionality.
    // No backend or navigation is implemented here.
    console.log(`Admin action selected: ${action}`);
  };

  const getApplicationStatusStyle = (status) => {
    switch (status) {
      case "Applied":
        return {
          ...styles.statusBadge,
          backgroundColor: "#eff6ff",
          color: "#2563eb",
        };

      case "Shortlisted":
        return {
          ...styles.statusBadge,
          backgroundColor: "#fef3c7",
          color: "#92400e",
        };

      case "Selected":
        return {
          ...styles.statusBadge,
          backgroundColor: "#dcfce7",
          color: "#15803d",
        };

      case "Rejected":
        return {
          ...styles.statusBadge,
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
        };

      default:
        return styles.statusBadge;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Dashboard Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span>Admin</span>
              <span style={styles.breadcrumbSeparator}>/</span>
              <span>Dashboard</span>
            </div>

            <h1 style={styles.pageTitle}>Admin Dashboard</h1>

            <p style={styles.pageSubtitle}>
              Manage students, companies, placement drives, and applications
              from one place.
            </p>
          </div>

          <div style={styles.headerBadge}>
            <span style={styles.onlineDot} />
            Admin Overview
          </div>
        </header>

        {/* Statistics */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>Overview</h2>
              <p style={styles.sectionSubtitle}>
                A quick overview of placement activities.
              </p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.title}>
                  <div style={styles.statCard}>
                    <div
                      style={{
                        ...styles.statIcon,
                        backgroundColor: stat.background,
                        color: stat.color,
                      }}
                    >
                      <Icon size={23} />
                    </div>

                    <div style={styles.statInformation}>
                      <p style={styles.statLabel}>{stat.title}</p>
                      <h3 style={styles.statValue}>{stat.value}</h3>
                      <p style={styles.statDescription}>
                        {stat.description}
                      </p>
                    </div>

                    <div style={styles.statArrow}>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Admin Quick Actions */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <p style={styles.sectionSubtitle}>
                Common administrative tasks.
              </p>
            </div>
          </div>

          <div style={styles.actionsGrid}>
            {adminActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.action}
                  type="button"
                  onClick={() => handleAdminAction(action.action)}
                  style={styles.actionCard}
                >
                  <div
                    style={{
                      ...styles.actionIcon,
                      backgroundColor: action.background,
                      color: action.color,
                    }}
                  >
                    <Icon size={23} />
                  </div>

                  <div style={styles.actionText}>
                    <h3 style={styles.actionTitle}>{action.title}</h3>
                    <p style={styles.actionDescription}>
                      {action.description}
                    </p>
                  </div>

                  <div style={styles.actionArrow}>
                    <Plus size={19} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Placement Drives */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Placement Drives</h2>
              <p style={styles.sectionSubtitle}>
                Latest placement opportunities added to the system.
              </p>
            </div>

            <button
              type="button"
              style={styles.viewAllButton}
              onClick={() => handleAdminAction("view-all-drives")}
            >
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          <Card>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Company & Role</th>
                    <th style={styles.tableHeader}>Package</th>
                    <th style={styles.tableHeader}>Deadline</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {recentDrives.map((drive) => (
                    <tr key={drive.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.companyCell}>
                          <div style={styles.companyIcon}>
                            <Building2 size={19} />
                          </div>

                          <div>
                            <p style={styles.companyName}>{drive.company}</p>
                            <p style={styles.secondaryText}>{drive.role}</p>
                          </div>
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <span style={styles.packageText}>{drive.package}</span>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.deadlineCell}>
                          <CalendarDays size={15} />
                          <span>{drive.deadline}</span>
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(drive.status === "Active"
                              ? styles.activeStatus
                              : styles.upcomingStatus),
                          }}
                        >
                          {drive.status === "Active" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}
                          {drive.status}
                        </span>
                      </td>

                      <td style={styles.tableCell}>
                        <button
                          type="button"
                          aria-label={`View ${drive.company} placement drive`}
                          style={styles.iconButton}
                          onClick={() =>
                            handleAdminAction(`view-drive-${drive.id}`)
                          }
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile placement drive cards */}
            <div style={styles.mobileList}>
              {recentDrives.map((drive) => (
                <div key={drive.id} style={styles.mobileItem}>
                  <div style={styles.mobileItemHeader}>
                    <div style={styles.companyCell}>
                      <div style={styles.companyIcon}>
                        <Building2 size={19} />
                      </div>

                      <div>
                        <p style={styles.companyName}>{drive.company}</p>
                        <p style={styles.secondaryText}>{drive.role}</p>
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(drive.status === "Active"
                          ? styles.activeStatus
                          : styles.upcomingStatus),
                      }}
                    >
                      {drive.status}
                    </span>
                  </div>

                  <div style={styles.mobileMeta}>
                    <span>{drive.package}</span>
                    <span>
                      <CalendarDays size={14} />
                      {drive.deadline}
                    </span>
                  </div>

                  <button
                    type="button"
                    style={styles.mobileViewButton}
                    onClick={() => handleAdminAction(`view-drive-${drive.id}`)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Recent Applications */}
        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Applications</h2>
              <p style={styles.sectionSubtitle}>
                Latest student applications and their current status.
              </p>
            </div>

            <button
              type="button"
              style={styles.viewAllButton}
              onClick={() => handleAdminAction("view-all-applications")}
            >
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          <Card>
            <div style={styles.applicationList}>
              {recentApplications.map((application) => (
                <div key={application.id} style={styles.applicationItem}>
                  <div style={styles.applicationStudent}>
                    <div style={styles.avatar}>{application.initials}</div>

                    <div style={styles.applicationInformation}>
                      <p style={styles.studentName}>{application.student}</p>
                      <p style={styles.secondaryText}>
                        {application.company} · {application.role}
                      </p>
                    </div>
                  </div>

                  <div style={styles.applicationRight}>
                    <span style={getApplicationStatusStyle(application.status)}>
                      {application.status === "Selected" && (
                        <AwardIcon />
                      )}
                      {application.status === "Shortlisted" && (
                        <CheckCircle2 size={14} />
                      )}
                      {application.status === "Rejected" && (
                        <XCircle size={14} />
                      )}
                      {application.status === "Applied" && (
                        <Clock3 size={14} />
                      )}
                      {application.status}
                    </span>

                    <span style={styles.applicationDate}>
                      {application.date}
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label={`View application from ${application.student}`}
                    style={styles.iconButton}
                    onClick={() =>
                      handleAdminAction(
                        `view-application-${application.id}`
                      )
                    }
                  >
                    <Eye size={17} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Dashboard Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerIcon}>
            <GraduationCap size={19} />
          </div>

          <p style={styles.footerText}>
            College Placement System
          </p>

          <span style={styles.footerNote}>Admin Panel · Demo Data</span>
        </footer>
      </div>
    </div>
  );
}

function AwardIcon() {
  return <GraduationCap size={14} />;
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f8fafc",
    padding: "32px 24px",
    boxSizing: "border-box",
    color: "#0f172a",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "32px",
  },

  breadcrumb: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "12px",
  },

  breadcrumbSeparator: {
    color: "#cbd5e1",
  },

  pageTitle: {
    margin: "0",
    fontSize: "30px",
    fontWeight: "750",
    letterSpacing: "-0.7px",
    color: "#0f172a",
  },

  pageSubtitle: {
    margin: "9px 0 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#64748b",
    maxWidth: "620px",
  },

  headerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },

  section: {
    marginBottom: "32px",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  statCard: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    minHeight: "112px",
    boxSizing: "border-box",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statInformation: {
    flex: "1",
    minWidth: "0",
  },

  statLabel: {
    margin: "1px 0 7px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  statValue: {
    margin: "0",
    fontSize: "27px",
    fontWeight: "750",
    letterSpacing: "-0.6px",
    color: "#0f172a",
  },

  statDescription: {
    margin: "7px 0 0",
    fontSize: "12px",
    color: "#94a3b8",
  },

  statArrow: {
    color: "#94a3b8",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },

  actionCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    padding: "18px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease",
  },

  actionIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    flex: "1",
    minWidth: "0",
  },

  actionTitle: {
    margin: "0",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "650",
  },

  actionDescription: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  actionArrow: {
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  },

  viewAllButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "650",
    cursor: "pointer",
    padding: "8px 0",
    fontFamily: "inherit",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
  },

  tableHeader: {
    padding: "14px 16px",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
  },

  tableCell: {
    padding: "15px 16px",
    color: "#334155",
    fontSize: "13px",
    verticalAlign: "middle",
  },

  companyCell: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: "200px",
  },

  companyIcon: {
    width: "39px",
    height: "39px",
    minWidth: "39px",
    borderRadius: "9px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  companyName: {
    margin: "0",
    fontSize: "13px",
    fontWeight: "650",
    lineHeight: "1.5",
    color: "#0f172a",
  },

  secondaryText: {
    margin: "4px 0 0",
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#64748b",
  },

  packageText: {
    color: "#0f172a",
    fontWeight: "650",
    whiteSpace: "nowrap",
  },

  deadlineCell: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "650",
    whiteSpace: "nowrap",
  },

  activeStatus: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  upcomingStatus: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
  },

  mobileList: {
    display: "none",
  },

  mobileItem: {
    padding: "16px 0",
    borderBottom: "1px solid #e2e8f0",
  },

  mobileItemHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  mobileMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "14px",
    color: "#64748b",
    fontSize: "12px",
  },

  mobileViewButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "14px",
    padding: "8px 11px",
    border: "1px solid #dbeafe",
    borderRadius: "7px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  applicationList: {
    display: "flex",
    flexDirection: "column",
  },

  applicationItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 4px",
    borderBottom: "1px solid #f1f5f9",
  },

  applicationStudent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: "1",
    minWidth: "0",
  },

  avatar: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
  },

  applicationInformation: {
    minWidth: "0",
  },

  studentName: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "650",
    color: "#0f172a",
  },

  applicationRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "7px",
  },

  applicationDate: {
    fontSize: "11px",
    color: "#94a3b8",
    whiteSpace: "nowrap",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    flexWrap: "wrap",
    padding: "22px 0 4px",
    borderTop: "1px solid #e2e8f0",
  },

  footerIcon: {
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  },

  footerText: {
    margin: "0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "650",
  },

  footerNote: {
    color: "#94a3b8",
    fontSize: "11px",
  },
};

export default AdminDashboard;