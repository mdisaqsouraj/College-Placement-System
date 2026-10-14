import React, { useMemo, useState } from "react";
import { Search, MapPin, Briefcase, IndianRupee, Building2 } from "lucide-react";
import Card from "../components/Card";

function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const companies = [
    {
      id: 1,
      name: "Tata Consultancy Services",
      location: "Mumbai, Maharashtra",
      industry: "IT Services",
      role: "Software Engineer",
      package: "₹7.5 LPA",
      description:
        "TCS is looking for software engineers to work on modern applications, cloud technologies, and enterprise solutions.",
    },
    {
      id: 2,
      name: "Infosys",
      location: "Pune, Maharashtra",
      industry: "IT Services",
      role: "Systems Engineer",
      package: "₹6.5 LPA",
      description:
        "Infosys offers opportunities for fresh graduates to work on software development, testing, and digital transformation projects.",
    },
    {
      id: 3,
      name: "Deloitte",
      location: "Bangalore, Karnataka",
      industry: "Consulting",
      role: "Technology Analyst",
      package: "₹8 LPA",
      description:
        "Deloitte is hiring technology professionals to work on consulting, software solutions, analytics, and digital transformation.",
    },
    {
      id: 4,
      name: "Wipro",
      location: "Hyderabad, Telangana",
      industry: "IT Services",
      role: "Project Engineer",
      package: "₹6 LPA",
      description:
        "Wipro provides technology and consulting services and offers freshers opportunities in software development and IT services.",
    },
    {
      id: 5,
      name: "Accenture",
      location: "Pune, Maharashtra",
      industry: "Consulting",
      role: "Associate Software Engineer",
      package: "₹7.2 LPA",
      description:
        "Accenture is looking for graduates interested in technology, cloud computing, software engineering, and business solutions.",
    },
    {
      id: 6,
      name: "Amazon",
      location: "Bangalore, Karnataka",
      industry: "E-Commerce",
      role: "Software Development Engineer",
      package: "₹12 LPA",
      description:
        "Amazon offers software engineering opportunities involving scalable applications, distributed systems, and customer-focused products.",
    },
    {
      id: 7,
      name: "Capgemini",
      location: "Pune, Maharashtra",
      industry: "IT Services",
      role: "Software Analyst",
      package: "₹6.8 LPA",
      description:
        "Capgemini provides technology services and is hiring graduates for software development, testing, and consulting roles.",
    },
    {
      id: 8,
      name: "ICICI Bank",
      location: "Mumbai, Maharashtra",
      industry: "Banking",
      role: "Technology Analyst",
      package: "₹7 LPA",
      description:
        "ICICI Bank offers technology roles focused on digital banking, application development, data, and financial technology solutions.",
    },
  ];

  const industries = [
    "All",
    ...new Set(companies.map((company) => company.industry)),
  ];

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        company.name.toLowerCase().includes(search) ||
        company.location.toLowerCase().includes(search) ||
        company.role.toLowerCase().includes(search) ||
        company.industry.toLowerCase().includes(search);

      const matchesIndustry =
        selectedIndustry === "All" ||
        company.industry === selectedIndustry;

      return matchesSearch && matchesIndustry;
    });
  }, [searchTerm, selectedIndustry]);

  const handleViewDetails = (company) => {
    alert(
      `${company.name}\n\nRole: ${company.role}\nLocation: ${company.location}\nPackage: ${company.package}`
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Companies</h1>
            <p style={styles.subtitle}>
              Explore companies and available placement opportunities.
            </p>
          </div>

          <div style={styles.companyCount}>
            <Building2 size={18} />
            <span>{filteredCompanies.length} Companies</span>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <div style={styles.filters}>
            <div style={styles.searchWrapper}>
              <Search size={20} style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search company, role, location or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterWrapper}>
              <label htmlFor="industry" style={styles.filterLabel}>
                Industry
              </label>

              <select
                id="industry"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                style={styles.select}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Company Cards */}
        {filteredCompanies.length > 0 ? (
          <div style={styles.companyGrid}>
            {filteredCompanies.map((company) => (
              <Card key={company.id}>
                <div style={styles.cardContent}>
                  <div style={styles.companyHeader}>
                    <div style={styles.companyIcon}>
                      <Building2 size={24} />
                    </div>

                    <div style={styles.companyTitleWrapper}>
                      <h2 style={styles.companyName}>{company.name}</h2>
                      <span style={styles.industryBadge}>
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  <div style={styles.details}>
                    <div style={styles.detailItem}>
                      <MapPin size={17} />
                      <span>{company.location}</span>
                    </div>

                    <div style={styles.detailItem}>
                      <Briefcase size={17} />
                      <span>{company.role}</span>
                    </div>

                    <div style={styles.detailItem}>
                      <IndianRupee size={17} />
                      <span>{company.package}</span>
                    </div>
                  </div>

                  <p style={styles.description}>{company.description}</p>

                  <button
                    type="button"
                    style={styles.viewButton}
                    onClick={() => handleViewDetails(company)}
                  >
                    View Details
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div style={styles.emptyState}>
              <Building2 size={42} />
              <h2 style={styles.emptyTitle}>No companies found</h2>
              <p style={styles.emptyText}>
                Try changing your search or selecting a different industry.
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

  companyCount: {
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
    flex: "1 1 400px",
    minWidth: "250px",
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
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },

  filterWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "220px",
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

  companyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
  },

  companyHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  companyIcon: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  companyTitleWrapper: {
    minWidth: "0",
    flex: "1",
  },

  companyName: {
    margin: "0 0 8px",
    fontSize: "18px",
    fontWeight: "650",
    color: "#0f172a",
    lineHeight: "1.3",
  },

  industryBadge: {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: "999px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
  },

  details: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },

  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#475569",
    fontSize: "14px",
  },

  description: {
    margin: "18px 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#64748b",
    flex: "1",
  },

  viewButton: {
    width: "100%",
    padding: "10px 16px",
    border: "1px solid #2563eb",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
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

export default Companies;