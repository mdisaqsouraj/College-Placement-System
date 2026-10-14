import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Building2,
  BriefcaseBusiness,
  IndianRupee,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Award,
} from "lucide-react";
import Card from "../components/Card";

function Applications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const applications = [
    {
      id: 1,
      company: "Tata Consultancy Services",
      jobRole: "Software Engineer",
      package: "₹7.5 LPA",
      appliedDate: "05 October 2026",
      status: "Applied",
    },
    {
      id: 2,
      company: "Infosys",
      jobRole: "Systems Engineer",
      package: "₹6.5 LPA",
      appliedDate: "02 October 2026",
      status: "Shortlisted",
    },
    {
      id: 3,
      company: "Deloitte",
      jobRole: "Technology Analyst",
      package: "₹8 LPA",
      appliedDate: "28 September 2026",
      status: "Rejected",
    },
    {
      id: 4,
      company: "Wipro",
      jobRole: "Project Engineer",
      package: "₹6 LPA",
      appliedDate: "25 September 2026",
      status: "Selected",
    },
    {
      id: 5,
      company: "Accenture",
      jobRole: "Associate Software Engineer",
      package: "₹7.2 LPA",
      appliedDate: "20 September 2026",
      status: "Shortlisted",
    },
    {
      id: 6,
      company: "Capgemini",
      jobRole: "Software Analyst",
      package: "₹6.8 LPA",
      appliedDate: "15 September 2026",
      status: "Applied",
    },
    {
      id: 7,
      company: "Amazon",
      jobRole: "Software Development Engineer",
      package: "₹12 LPA",
      appliedDate: "10 September 2026",
      status: "Rejected",
    },
    {
      id: 8,
      company: "ICICI Bank",
      jobRole: "Technology Analyst",
      package: "₹7 LPA",
      appliedDate: "05 September 2026",
      status: "Selected",
    },
  ];

  const filteredApplications = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return applications.filter((application) => {
      const matchesSearch =
        application.company.toLowerCase().includes(search) ||
        application.jobRole.toLowerCase().includes(search) ||
        application.package.toLowerCase().includes(search) ||
        application.status.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Applied":
        return {
          badge: styles.appliedBadge,
          icon: <Clock3 size={15} />,
        };

      case "Shortlisted":
        return {
          badge: styles.shortlistedBadge,
          icon: <CheckCircle2 size={15} />,
        };

      case "Rejected":
        return {
          badge: styles.rejectedBadge,
          icon: <XCircle size={15} />,
        };

      case "Selected":
        return {
          badge: styles.selectedBadge,
          icon: <Award size={15} />,
        };

      default:
        return {
          badge: styles.defaultBadge,
          icon: <FileText size={15} />,
        };
    }
  };

  const getStatusCount = (status) => {
    return applications.filter(
      (application) => application.status === status
    ).length;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Applications</h1>
            <p style={styles.subtitle}>
              Track the status of your placement applications.
            </p>
          </div>

          <div style={styles.totalCount}>
            <FileText size={18} />
            <span>{filteredApplications.length} Applications</span>
          </div>
        </div>

        {/* Application Summary */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, ...styles.blueIcon }}>
              <FileText size={20} />
            </div>
            <div>
              <span style={styles.summaryLabel}>Applied</span>
              <strong style={styles.summaryValue}>
                {getStatusCount("Applied")}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, ...styles.yellowIcon }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span style={styles.summaryLabel}>Shortlisted</span>
              <strong style={styles.summaryValue}>
                {getStatusCount("Shortlisted")}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, ...styles.redIcon }}>
              <XCircle size={20} />
            </div>
            <div>
              <span style={styles.summaryLabel}>Rejected</span>
              <strong style={styles.summaryValue}>
                {getStatusCount("Rejected")}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryIcon, ...styles.greenIcon }}>
              <Award size={20} />
            </div>
            <div>
              <span style={styles.summaryLabel}>Selected</span>
              <strong style={styles.summaryValue}>
                {getStatusCount("Selected")}
              </strong>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <div style={styles.filters}>
            <div style={styles.searchWrapper}>
              <Search size={20} style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search company, job role or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterWrapper}>
              <Filter size={17} style={styles.filterIcon} />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Selected">Selected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Desktop Table */}
        {filteredApplications.length > 0 ? (
          <Card>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Company</th>
                    <th style={styles.tableHeader}>Job Role</th>
                    <th style={styles.tableHeader}>Package</th>
                    <th style={styles.tableHeader}>Applied Date</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => {
                    const status = getStatusStyle(application.status);

                    return (
                      <tr key={application.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={styles.companyCell}>
                            <div style={styles.companyIcon}>
                              <Building2 size={19} />
                            </div>
                            <span style={styles.companyName}>
                              {application.company}
                            </span>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div style={styles.roleCell}>
                            <BriefcaseBusiness size={16} />
                            <span>{application.jobRole}</span>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div style={styles.packageCell}>
                            <IndianRupee size={15} />
                            <span>{application.package}</span>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div style={styles.dateCell}>
                            <CalendarDays size={16} />
                            <span>{application.appliedDate}</span>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <span style={{ ...styles.statusBadge, ...status.badge }}>
                            {status.icon}
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div style={styles.mobileList}>
              {filteredApplications.map((application) => {
                const status = getStatusStyle(application.status);

                return (
                  <div key={application.id} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <div style={styles.mobileCompany}>
                        <div style={styles.companyIcon}>
                          <Building2 size={19} />
                        </div>

                        <div>
                          <h3 style={styles.mobileCompanyName}>
                            {application.company}
                          </h3>
                          <p style={styles.mobileRole}>
                            {application.jobRole}
                          </p>
                        </div>
                      </div>

                      <span style={{ ...styles.statusBadge, ...status.badge }}>
                        {status.icon}
                        {application.status}
                      </span>
                    </div>

                    <div style={styles.mobileDetails}>
                      <div style={styles.mobileDetail}>
                        <IndianRupee size={16} />
                        <div>
                          <span style={styles.mobileLabel}>Package</span>
                          <strong>{application.package}</strong>
                        </div>
                      </div>

                      <div style={styles.mobileDetail}>
                        <CalendarDays size={16} />
                        <div>
                          <span style={styles.mobileLabel}>Applied Date</span>
                          <strong>{application.appliedDate}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <div style={styles.emptyState}>
              <FileText size={42} />
              <h2 style={styles.emptyTitle}>No applications found</h2>
              <p style={styles.emptyText}>
                Try changing your search or status filter.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "32px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },

  title: {
    margin: "0",
    fontSize: "30px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: "15px",
    color: "#64748b",
  },

  totalCount: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxSizing: "border-box",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  blueIcon: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },

  yellowIcon: {
    backgroundColor: "#fefce8",
    color: "#ca8a04",
  },

  redIcon: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },

  greenIcon: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
  },

  summaryLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "3px",
  },

  summaryValue: {
    display: "block",
    fontSize: "20px",
    color: "#0f172a",
  },

  filters: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  searchWrapper: {
    position: "relative",
    flex: "1 1 400px",
    minWidth: "240px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "44px",
    padding: "0 14px 0 44px",
    border: "1px solid #dbe2ea",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },

  filterWrapper: {
    position: "relative",
    width: "210px",
    minWidth: "180px",
  },

  filterIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    pointerEvents: "none",
    zIndex: 1,
  },

  select: {
    width: "100%",
    height: "44px",
    padding: "0 12px 0 38px",
    border: "1px solid #dbe2ea",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    boxSizing: "border-box",
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
    textAlign: "left",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #f1f5f9",
  },

  tableCell: {
    padding: "16px",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  companyCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "190px",
  },

  companyIcon: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  companyName: {
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: "1.4",
  },

  roleCell: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },

  packageCell: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  appliedBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },

  shortlistedBadge: {
    backgroundColor: "#fefce8",
    color: "#a16207",
  },

  rejectedBadge: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },

  selectedBadge: {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
  },

  defaultBadge: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
  },

  mobileList: {
    display: "none",
  },

  mobileCard: {
    padding: "16px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  mobileCompany: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "0",
  },

  mobileCompanyName: {
    margin: "0",
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: "1.4",
  },

  mobileRole: {
    margin: "3px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  mobileDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
  },

  mobileDetail: {
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    color: "#64748b",
    fontSize: "13px",
  },

  mobileLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "3px",
  },

  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#94a3b8",
  },

  emptyTitle: {
    margin: "14px 0 8px",
    fontSize: "20px",
    color: "#334155",
  },

  emptyText: {
    margin: "0",
    fontSize: "14px",
    color: "#64748b",
  },

  "@media (max-width: 768px)": {},
};

export default Applications;