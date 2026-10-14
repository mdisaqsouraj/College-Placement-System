import React, { useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  IndianRupee,
  GraduationCap,
  GitBranch,
  CalendarDays,
  FileCheck2,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "../components/Card";

function PlacementDrives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eligibilityFilter, setEligibilityFilter] = useState("All");

  // Dummy student data used only to demonstrate eligibility.
  const student = {
    cgpa: 8.2,
    branch: "Computer Science",
    backlogs: 0,
  };

  const placementDrives = [
    {
      id: 1,
      companyName: "Tata Consultancy Services",
      jobRole: "Software Engineer",
      package: "₹7.5 LPA",
      minimumCgpa: 7.0,
      eligibleBranches: ["Computer Science", "Information Technology"],
      maximumBacklogs: 0,
      deadline: "15 October 2026",
      status: "Open",
    },
    {
      id: 2,
      companyName: "Infosys",
      jobRole: "Systems Engineer",
      package: "₹6.5 LPA",
      minimumCgpa: 6.5,
      eligibleBranches: [
        "Computer Science",
        "Information Technology",
        "Electronics",
      ],
      maximumBacklogs: 1,
      deadline: "20 October 2026",
      status: "Open",
    },
    {
      id: 3,
      companyName: "Deloitte",
      jobRole: "Technology Analyst",
      package: "₹8 LPA",
      minimumCgpa: 8.5,
      eligibleBranches: ["Computer Science", "Information Technology"],
      maximumBacklogs: 0,
      deadline: "25 October 2026",
      status: "Open",
    },
    {
      id: 4,
      companyName: "Wipro",
      jobRole: "Project Engineer",
      package: "₹6 LPA",
      minimumCgpa: 6.0,
      eligibleBranches: [
        "Computer Science",
        "Information Technology",
        "Electronics",
      ],
      maximumBacklogs: 2,
      deadline: "30 October 2026",
      status: "Open",
    },
    {
      id: 5,
      companyName: "Accenture",
      jobRole: "Associate Software Engineer",
      package: "₹7.2 LPA",
      minimumCgpa: 7.5,
      eligibleBranches: ["Computer Science", "Information Technology"],
      maximumBacklogs: 0,
      deadline: "5 November 2026",
      status: "Upcoming",
    },
    {
      id: 6,
      companyName: "Amazon",
      jobRole: "Software Development Engineer",
      package: "₹12 LPA",
      minimumCgpa: 8.5,
      eligibleBranches: ["Computer Science"],
      maximumBacklogs: 0,
      deadline: "10 November 2026",
      status: "Upcoming",
    },
    {
      id: 7,
      companyName: "Capgemini",
      jobRole: "Software Analyst",
      package: "₹6.8 LPA",
      minimumCgpa: 6.5,
      eligibleBranches: ["Computer Science", "Information Technology"],
      maximumBacklogs: 0,
      deadline: "12 November 2026",
      status: "Closed",
    },
    {
      id: 8,
      companyName: "ICICI Bank",
      jobRole: "Technology Analyst",
      package: "₹7 LPA",
      minimumCgpa: 7.0,
      eligibleBranches: ["Computer Science", "Information Technology"],
      maximumBacklogs: 1,
      deadline: "18 November 2026",
      status: "Closed",
    },
  ];

  const checkEligibility = (drive) => {
    const cgpaEligible = student.cgpa >= drive.minimumCgpa;
    const branchEligible = drive.eligibleBranches.includes(student.branch);
    const backlogEligible = student.backlogs <= drive.maximumBacklogs;

    return cgpaEligible && branchEligible && backlogEligible;
  };

  const filteredDrives = useMemo(() => {
    return placementDrives.filter((drive) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        drive.companyName.toLowerCase().includes(search) ||
        drive.jobRole.toLowerCase().includes(search) ||
        drive.package.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || drive.status === statusFilter;

      const isEligible = checkEligibility(drive);

      const matchesEligibility =
        eligibilityFilter === "All" ||
        (eligibilityFilter === "Eligible" && isEligible) ||
        (eligibilityFilter === "Not Eligible" && !isEligible);

      return matchesSearch && matchesStatus && matchesEligibility;
    });
  }, [searchTerm, statusFilter, eligibilityFilter]);

  const handleApply = (drive) => {
    alert(`Application started for ${drive.companyName} - ${drive.jobRole}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Placement Drives</h1>
            <p style={styles.subtitle}>
              Find placement opportunities and check your eligibility.
            </p>
          </div>

          <div style={styles.driveCount}>
            <BriefcaseBusiness size={18} />
            <span>{filteredDrives.length} Drives</span>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div style={styles.filters}>
            <div style={styles.searchWrapper}>
              <Search size={20} style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search company, job role or package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterWrapper}>
              <label htmlFor="status" style={styles.filterLabel}>
                Drive Status
              </label>

              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={styles.filterWrapper}>
              <label htmlFor="eligibility" style={styles.filterLabel}>
                Eligibility
              </label>

              <select
                id="eligibility"
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All</option>
                <option value="Eligible">Eligible</option>
                <option value="Not Eligible">Not Eligible</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Student Eligibility Information */}
        <div style={styles.studentInfo}>
          <GraduationCap size={18} />
          <span>
            Your CGPA: <strong>{student.cgpa}</strong>
          </span>
          <span>
            Branch: <strong>{student.branch}</strong>
          </span>
          <span>
            Backlogs: <strong>{student.backlogs}</strong>
          </span>
        </div>

        {/* Placement Drive Cards */}
        {filteredDrives.length > 0 ? (
          <div style={styles.driveGrid}>
            {filteredDrives.map((drive) => {
              const isEligible = checkEligibility(drive);

              return (
                <Card key={drive.id}>
                  <div style={styles.cardContent}>
                    {/* Company and Status */}
                    <div style={styles.cardHeader}>
                      <div style={styles.companyIcon}>
                        <BriefcaseBusiness size={24} />
                      </div>

                      <div style={styles.companyInfo}>
                        <h2 style={styles.companyName}>
                          {drive.companyName}
                        </h2>

                        <p style={styles.jobRole}>{drive.jobRole}</p>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(drive.status === "Open"
                            ? styles.openStatus
                            : drive.status === "Upcoming"
                              ? styles.upcomingStatus
                              : styles.closedStatus),
                        }}
                      >
                        {drive.status}
                      </span>
                    </div>

                    {/* Package */}
                    <div style={styles.packageBox}>
                      <IndianRupee size={20} />
                      <div>
                        <span style={styles.packageLabel}>Package</span>
                        <strong style={styles.packageValue}>
                          {drive.package}
                        </strong>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div
                      style={{
                        ...styles.eligibilityBox,
                        ...(isEligible
                          ? styles.eligibleBox
                          : styles.notEligibleBox),
                      }}
                    >
                      {isEligible ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}

                      <div>
                        <strong>
                          {isEligible ? "Eligible" : "Not Eligible"}
                        </strong>

                        <p>
                          {isEligible
                            ? "You meet all eligibility requirements."
                            : "You do not meet all eligibility requirements."}
                        </p>
                      </div>
                    </div>

                    {/* Drive Details */}
                    <div style={styles.details}>
                      <div style={styles.detailItem}>
                        <GraduationCap size={17} />
                        <div>
                          <span style={styles.detailLabel}>
                            Minimum CGPA
                          </span>
                          <span style={styles.detailValue}>
                            {drive.minimumCgpa}
                          </span>
                        </div>
                      </div>

                      <div style={styles.detailItem}>
                        <GitBranch size={17} />
                        <div>
                          <span style={styles.detailLabel}>
                            Eligible Branches
                          </span>
                          <span style={styles.detailValue}>
                            {drive.eligibleBranches.join(", ")}
                          </span>
                        </div>
                      </div>

                      <div style={styles.detailItem}>
                        <FileCheck2 size={17} />
                        <div>
                          <span style={styles.detailLabel}>
                            Maximum Backlogs
                          </span>
                          <span style={styles.detailValue}>
                            {drive.maximumBacklogs}
                          </span>
                        </div>
                      </div>

                      <div style={styles.detailItem}>
                        <CalendarDays size={17} />
                        <div>
                          <span style={styles.detailLabel}>
                            Application Deadline
                          </span>
                          <span style={styles.detailValue}>
                            {drive.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => handleApply(drive)}
                      disabled={!isEligible || drive.status !== "Open"}
                      style={{
                        ...styles.applyButton,
                        ...(!isEligible || drive.status !== "Open"
                          ? styles.disabledButton
                          : {}),
                      }}
                    >
                      {drive.status === "Closed" ? (
                        <>
                          <XCircle size={17} />
                          Application Closed
                        </>
                      ) : drive.status === "Upcoming" ? (
                        <>
                          <Clock3 size={17} />
                          Coming Soon
                        </>
                      ) : !isEligible ? (
                        <>
                          <XCircle size={17} />
                          Not Eligible
                        </>
                      ) : (
                        <>
                          <FileCheck2 size={17} />
                          Apply Now
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div style={styles.emptyState}>
              <BriefcaseBusiness size={42} />
              <h2 style={styles.emptyTitle}>No placement drives found</h2>
              <p style={styles.emptyText}>
                Try changing your search or filter selection.
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

  driveCount: {
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

  filters: {
    display: "flex",
    gap: "16px",
    alignItems: "end",
    flexWrap: "wrap",
  },

  searchWrapper: {
    position: "relative",
    flex: "1 1 350px",
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
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "180px",
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },

  select: {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    border: "1px solid #dbe2ea",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    marginTop: "20px",
    padding: "14px 18px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
  },

  driveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  companyIcon: {
    width: "46px",
    height: "46px",
    minWidth: "46px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  companyInfo: {
    flex: "1",
    minWidth: "0",
  },

  companyName: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "650",
    color: "#0f172a",
    lineHeight: "1.3",
  },

  jobRole: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  openStatus: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  upcomingStatus: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },

  closedStatus: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },

  packageBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "18px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    color: "#2563eb",
  },

  packageLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "2px",
  },

  packageValue: {
    display: "block",
    fontSize: "16px",
    color: "#0f172a",
  },

  eligibilityBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "14px",
    padding: "12px",
    borderRadius: "8px",
  },

  eligibleBox: {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
  },

  notEligibleBox: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },

  details: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },

  detailItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    color: "#64748b",
  },

  detailLabel: {
    display: "block",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "2px",
  },

  detailValue: {
    display: "block",
    fontSize: "13px",
    lineHeight: "1.4",
    color: "#334155",
  },

  eligibilityBoxText: {
    fontSize: "13px",
  },

  applyButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    padding: "11px 16px",
    border: "1px solid #2563eb",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  disabledButton: {
    backgroundColor: "#e2e8f0",
    borderColor: "#e2e8f0",
    color: "#64748b",
    cursor: "not-allowed",
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
};

export default PlacementDrives;