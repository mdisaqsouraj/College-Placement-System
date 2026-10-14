import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Hash,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  FileText,
  Download,
  Pencil,
  Save,
  X,
  Code2,
  Wrench,
} from "lucide-react";
import Card from "../components/Card";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    rollNumber: "CS2024001",
    phone: "+91 98765 43210",
    college: "ABC Institute of Technology",
    branch: "Computer Science",
    year: "3rd Year",
    cgpa: "8.42",
    backlogs: "0",
    programmingLanguages: "Java, Python, JavaScript, C++",
    technicalSkills:
      "React, Node.js, Express.js, MongoDB, Git, SQL",
    resume: "Rahul_Sharma_Resume.pdf",
  });

  const [editData, setEditData] = useState(profile);

  const handleEdit = () => {
    setEditData(profile);
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Backend update logic will be added later.
    setProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const InfoItem = ({ icon: Icon, label, value, name }) => {
    return (
      <div style={styles.infoItem}>
        <div style={styles.infoIcon}>
          <Icon size={18} />
        </div>

        <div style={styles.infoContent}>
          <span style={styles.infoLabel}>{label}</span>

          {isEditing && name ? (
            <input
              name={name}
              value={editData[name]}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <span style={styles.infoValue}>{value || "Not provided"}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <p style={styles.pageLabel}>Student Portal</p>

            <h1 style={styles.title}>My Profile</h1>

            <p style={styles.subtitle}>
              View and manage your personal and academic information.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={handleEdit}
              style={styles.editButton}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <div style={styles.actionButtons}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                style={styles.saveButton}
              >
                <Save size={17} />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Profile Overview */}
        <Card>
          <div style={styles.profileOverview}>
            <div style={styles.avatar}>
              <User size={34} />
            </div>

            <div>
              <h2 style={styles.profileName}>{profile.name}</h2>

              <p style={styles.profileRole}>
                {profile.branch} • {profile.year}
              </p>

              <p style={styles.profileEmail}>{profile.email}</p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <section style={styles.section}>
          <Card
            title="Personal Information"
            description="Your basic personal details"
          >
            <div style={styles.infoGrid}>
              <InfoItem
                icon={User}
                label="Full Name"
                value={profile.name}
                name="name"
              />

              <InfoItem
                icon={Mail}
                label="Email"
                value={profile.email}
                name="email"
              />

              <InfoItem
                icon={Hash}
                label="Roll Number"
                value={profile.rollNumber}
                name="rollNumber"
              />

              <InfoItem
                icon={Phone}
                label="Phone"
                value={profile.phone}
                name="phone"
              />
            </div>
          </Card>
        </section>

        {/* Academic Information */}
        <section style={styles.section}>
          <Card
            title="Academic Information"
            description="Your academic details"
          >
            <div style={styles.infoGrid}>
              <InfoItem
                icon={Building2}
                label="College"
                value={profile.college}
                name="college"
              />

              <InfoItem
                icon={BookOpen}
                label="Branch"
                value={profile.branch}
                name="branch"
              />

              <InfoItem
                icon={GraduationCap}
                label="Year"
                value={profile.year}
                name="year"
              />

              <InfoItem
                icon={Award}
                label="CGPA"
                value={profile.cgpa}
                name="cgpa"
              />

              <InfoItem
                icon={BookOpen}
                label="Backlogs"
                value={profile.backlogs}
                name="backlogs"
              />
            </div>
          </Card>
        </section>

        {/* Skills */}
        <section style={styles.section}>
          <Card
            title="Skills"
            description="Technical skills and programming knowledge"
          >
            <div style={styles.skillsContainer}>
              <div style={styles.skillGroup}>
                <div style={styles.skillHeading}>
                  <Code2 size={18} />
                  <h3>Programming Languages</h3>
                </div>

                {isEditing ? (
                  <textarea
                    name="programmingLanguages"
                    value={editData.programmingLanguages}
                    onChange={handleChange}
                    rows="3"
                    style={styles.textarea}
                  />
                ) : (
                  <div style={styles.skillTags}>
                    {profile.programmingLanguages
                      .split(",")
                      .map((skill) => (
                        <span key={skill} style={styles.skillTag}>
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div style={styles.skillGroup}>
                <div style={styles.skillHeading}>
                  <Wrench size={18} />
                  <h3>Technical Skills</h3>
                </div>

                {isEditing ? (
                  <textarea
                    name="technicalSkills"
                    value={editData.technicalSkills}
                    onChange={handleChange}
                    rows="3"
                    style={styles.textarea}
                  />
                ) : (
                  <div style={styles.skillTags}>
                    {profile.technicalSkills
                      .split(",")
                      .map((skill) => (
                        <span key={skill} style={styles.skillTag}>
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Resume */}
        <section style={styles.section}>
          <Card
            title="Resume"
            description="Your latest resume"
          >
            <div style={styles.resumeContainer}>
              <div style={styles.resumeInfo}>
                <div style={styles.resumeIcon}>
                  <FileText size={24} />
                </div>

                <div>
                  <h3 style={styles.resumeName}>
                    {profile.resume}
                  </h3>

                  <p style={styles.resumeText}>
                    PDF Document
                  </p>
                </div>
              </div>

              <div style={styles.resumeActions}>
                <button
                  type="button"
                  style={styles.viewButton}
                  onClick={() => {
                    // Resume viewing will be connected later.
                  }}
                >
                  <FileText size={16} />
                  View
                </button>

                <button
                  type="button"
                  style={styles.downloadButton}
                  onClick={() => {
                    // Resume download logic will be connected later.
                  }}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <style>
        {`
          @media (max-width: 700px) {
            .profile-page-header {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>
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
    maxWidth: "1100px",
    margin: "0 auto",
  },

  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  pageLabel: {
    margin: "0 0 4px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
  },

  title: {
    margin: "0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    margin: "7px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  actionButtons: {
    display: "flex",
    gap: "9px",
  },

  cancelButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 15px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 15px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  profileOverview: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  avatar: {
    width: "72px",
    height: "72px",
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
  },

  profileName: {
    margin: "0",
    fontSize: "21px",
    fontWeight: "700",
    color: "#0f172a",
  },

  profileRole: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#475569",
  },

  profileEmail: {
    margin: "0",
    fontSize: "13px",
    color: "#64748b",
  },

  section: {
    marginTop: "20px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  infoIcon: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  },

  infoContent: {
    minWidth: "0",
    flex: "1",
  },

  infoLabel: {
    display: "block",
    marginBottom: "5px",
    fontSize: "12px",
    color: "#64748b",
  },

  infoValue: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    wordBreak: "break-word",
  },

  input: {
    width: "100%",
    height: "38px",
    padding: "0 10px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },

  skillsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "30px",
  },

  skillGroup: {
    minWidth: "0",
  },

  skillHeading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "13px",
    color: "#334155",
  },

  skillHeadingH3: {
    margin: "0",
  },

  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  skillTag: {
    padding: "6px 10px",
    borderRadius: "6px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "600",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#334155",
  },

  resumeContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  resumeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "0",
  },

  resumeIcon: {
    width: "46px",
    height: "46px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },

  resumeName: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    wordBreak: "break-word",
  },

  resumeText: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  resumeActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 13px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default StudentProfile;