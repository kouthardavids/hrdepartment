import React, { useState, useEffect, useMemo, useRef } from "react";
import AttendanceDataRaw from "../data/attendance.json";

const departmentMap = {
  1: "HR",
  2: "Engineering",
  3: "Engineering",
  4: "Sales",
  5: "HR",
  6: "Finance",
  7: "Engineering",
  8: "HR",
  9: "Marketing",
  10: "HR",
};
const departmentsList = ["HR", "Engineering", "Sales", "Finance", "Marketing", "General"];

const statuses = ["Present", "Absent", "Late", "On Leave"];

const STORAGE_KEY = "attendance_records";

const styles = {
  container: {
    padding: 40,
    fontFamily: "'Raleway', sans-serif",
    color: "#393739",
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    overflow: "hidden",
    transition: "all 0.35s ease-in-out",
    width: "100%",
  },
  input: {
    padding: 5,
    marginRight: 10,
    borderRadius: 5,
    border: "1px solid #262626",
  },
  select: {
    cursor: "pointer",
    textAlign: "center",
    borderRadius: 5,
    border: "1px solid #262626",
    padding: 5,
  },
  button: {
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    backgroundImage: "linear-gradient(#7e289e , #9b59b6)",
    borderRadius: 19,
    padding: "10px 32px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    minWidth: 60,
  },
  buttonHover: {
    backgroundImage: "linear-gradient(#a750c4 , #9b59b6)",
    boxShadow: "0 2px 5px rgba(155, 89, 182, 0.8)",
    transform: "scale(1.01)",
  },
  totalPresentText: {
    color: "#262626",
    fontWeight: 600,
  },
  instructionText: {
    marginBottom: 20,
    fontStyle: "italic",
    color: "#7e289e",
    fontSize: "1rem",
    fontWeight: "bold",
    fontFamily: "'Raleway', sans-serif",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 40,
  },
  th: {
    border: "1px solid #ddd",
    padding: 8,
    textAlign: "left",
    backgroundColor: "#262626",
    color: "#fff",
  },
  td: {
    border: "1px solid #ddd",
    padding: 8,
    textAlign: "left",
    verticalAlign: "middle",
  },
  tdCenter: {
    textAlign: "center",
    border: "1px solid #ddd",
    padding: 8,
    verticalAlign: "middle",
  },
  actionCell: {
    border: "1px solid #ddd",
    padding: 8,
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 8,
    overflowY: "auto",
    maxWidth: 700,
    margin: "auto 0",
    maxHeight: "90vh",
    minWidth: 300,
  },
  modalCloseButton: {
    marginTop: 20,
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: "1rem",
    backgroundImage: "linear-gradient(#7e289e , #9b59b6)",
    borderRadius: 19,
    padding: "10px 50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  modalCloseButtonHover: {
    backgroundImage: "linear-gradient(#a750c4 , #9b59b6)",
    boxShadow: "0 2px 5px rgba(155, 89, 182, 0.8)",
    transform: "scale(1.01)",
  },
  statusColors: {
    Present: { color: "#16a34a" },
    Absent: { color: "#dc2626" },
    Late: { color: "#eab308" },
    "On Leave": { color: "#3b82f6" },
    Default: { color: "#9ca3af" },
  },
  draggingRow: {
    backgroundColor: "#e0d7f7",
    opacity: 0.7,
  },
  dragOverRow: {
    backgroundColor: "#c8b9e8",
  },
};

function dateToComparable(dateStr) {
  return Number(dateStr.replace(/-/g, ""));
}

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editAttendance, setEditAttendance] = useState({});
  const [buttonHover, setButtonHover] = useState(null);
  const [modalButtonHover, setModalButtonHover] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  const dragItemIndex = useRef(null);
  const dragOverItemIndex = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDepartment, setNewEmployeeDepartment] = useState(departmentsList[0]);
  const [newEmployeeAttendance, setNewEmployeeAttendance] = useState({});

  useEffect(() => setSlideIn(true), []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAttendanceRecords(JSON.parse(saved));
        return;
      } catch {
        // ignore parse errors
      }
    }
    const raw = AttendanceDataRaw.attendanceAndLeave || [];
    const data = raw.map(({ employeeId, name, attendance, leaveRequests }) => ({
      id: employeeId,
      name,
      department: departmentMap[employeeId] || "General",
      attendance: Object.fromEntries(attendance.map(({ date, status }) => [date, status])),
      leaveRequests,
    }));
    setAttendanceRecords(data);
  }, []);

  useEffect(() => {
    if (attendanceRecords.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const allDates = useMemo(() => {
    const dates = new Set();
    attendanceRecords.forEach(({ attendance }) =>
      Object.keys(attendance).forEach((date) => dates.add(date))
    );
    return [...dates].sort();
  }, [attendanceRecords]);

  const departments = useMemo(
    () => ["All", ...new Set(attendanceRecords.map(({ department }) => department))],
    [attendanceRecords]
  );

  const filteredEmployees = useMemo(
    () =>
      attendanceRecords.filter(
        ({ name, department }) =>
          name.toLowerCase().includes(searchName.toLowerCase()) &&
          (selectedDepartment === "All" || department === selectedDepartment)
      ),
    [attendanceRecords, searchName, selectedDepartment]
  );

  const updateTotalPresent = () =>
    attendanceRecords.reduce((total, { attendance }) => {
      return (
        total +
        Object.entries(attendance).filter(([date, status]) => status === "Present").length
      );
    }, 0);

  const openModal = (emp, edit = false) => {
    setSelectedEmployee(emp);
    setEditMode(edit);
    if (edit) setEditAttendance({ ...emp.attendance });
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setEditMode(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setAttendanceRecords((prev) => prev.filter((emp) => emp.id !== id));
      if (selectedEmployee?.id === id) closeModal();
    }
  };

  const handleStatusChange = (date, status) => setEditAttendance((prev) => ({ ...prev, [date]: status }));

  const saveEdits = () => {
    setAttendanceRecords((prev) =>
      prev.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, attendance: { ...editAttendance } } : emp))
    );
    setSelectedEmployee((prev) => ({ ...prev, attendance: { ...editAttendance } }));
    setEditMode(false);
  };

  const handleDragStart = (index) => {
    dragItemIndex.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index) => {
    dragOverItemIndex.current = index;
    setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverItemIndex.current === index) {
      dragOverItemIndex.current = null;
      setDragOverIndex(null);
    }
  };

  // When we change the order, we also change the id
  const handleDrop = () => {
    const fromIndex = dragItemIndex.current;
    const toIndex = dragOverItemIndex.current;

    if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    setAttendanceRecords((prev) => {
      const newList = [...prev];
      const [movedItem] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, movedItem);

      // Remap IDs to sequential 1-based indexes
      return newList.map((emp, i) => ({
        ...emp,
        id: i + 1,
      }));
    });

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const simulateAttendance = () => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((emp) => {
        const newAttendance = { ...emp.attendance };
        allDates.forEach((date) => {
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          newAttendance[date] = randomStatus;
        });
        return { ...emp, attendance: newAttendance };
      })
    );
  };

  const handleNewEmployeeAttendanceChange = (date, status) => {
    setNewEmployeeAttendance((prev) => ({
      ...prev,
      [date]: status,
    }));
  };

  const openAddModal = () => {
    setNewEmployeeName("");
    setNewEmployeeDepartment(departmentsList[0]);
    setNewEmployeeAttendance({});
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const saveNewEmployee = () => {
    if (!newEmployeeName.trim()) {
      alert("Please enter employee name");
      return;
    }
    const newId = attendanceRecords.length > 0 ? attendanceRecords.length + 1 : 1;

    const newEmp = {
      id: newId,
      name: newEmployeeName.trim(),
      department: newEmployeeDepartment,
      attendance: newEmployeeAttendance,
      leaveRequests: [],
    };

    setAttendanceRecords((prev) => [...prev, newEmp]);
    setAddModalOpen(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontWeight: 600, marginBottom: 6 }}>Attendance Page</h2>

      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={styles.input}
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={styles.select}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button
          onClick={simulateAttendance}
          style={buttonHover === "simulate" ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onMouseEnter={() => setButtonHover("simulate")}
          onMouseLeave={() => setButtonHover(null)}
          type="button"
          title="Simulate Random Attendance for All Dates"
        >
          Simulate Attendance
        </button>

        <button
          onClick={openAddModal}
          style={buttonHover === "add" ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onMouseEnter={() => setButtonHover("add")}
          onMouseLeave={() => setButtonHover(null)}
          type="button"
          title="Add New Employee"
        >
          Add Employee
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Total Present Days (All Dates, All Employees): </strong>{" "}
        <span style={styles.totalPresentText}>{updateTotalPresent()}</span>
      </div>

      <div style={styles.instructionText}>* Drag and drop rows to reorder employees as needed.</div>

      <table style={{ ...styles.table, animation: slideIn ? "slide-in-right 0.5s ease forwards" : "none" }}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            {allDates.map((date) => (
              <th key={date} style={styles.th}>
                {date}
              </th>
            ))}
            <th style={{ ...styles.th, textAlign: "center", minWidth: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, index) => {
            const isDragging = index === draggingIndex;
            const isDragOver = index === dragOverIndex && draggingIndex !== index;

            return (
              <tr
                key={emp.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => handleDragLeave(index)}
                onDrop={handleDrop}
                style={{
                  ...(isDragging ? styles.draggingRow : {}),
                  ...(isDragOver ? styles.dragOverRow : {}),
                  cursor: "grab",
                }}
              >
                <td
                  style={styles.td}
                  onClick={() => openModal(emp, false)}
                  title="Click to view details"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openModal(emp, false)}
                >
                  {emp.name}
                </td>
                {allDates.map((date) => {
                  const status = emp.attendance[date] || "—";
                  const colorStyle = styles.statusColors[status] || styles.statusColors.Default;
                  return (
                    <td key={date} style={{ ...styles.tdCenter, ...colorStyle, fontWeight: "bold" }}>
                      {status}
                    </td>
                  );
                })}
                <td style={styles.actionCell}>
                  <span style={{ display: "inline-flex", gap: 8, justifyContent: "center" }}>
                    <button
                      style={
                        buttonHover === `edit-${emp.id}`
                          ? { ...styles.button, ...styles.buttonHover, padding: "5px 15px", minWidth: 70, fontSize: "0.8rem" }
                          : { ...styles.button, padding: "5px 15px", minWidth: 70, fontSize: "0.8rem" }
                      }
                      onClick={() => openModal(emp, true)}
                      onMouseEnter={() => setButtonHover(`edit-${emp.id}`)}
                      onMouseLeave={() => setButtonHover(null)}
                      type="button"
                      title="Edit Attendance"
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...styles.button, backgroundColor: "#dc2626", padding: "5px 15px", minWidth: 70, fontSize: "0.8rem" }}
                      onClick={() => handleDelete(emp.id)}
                      type="button"
                      title="Delete Employee"
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
          {filteredEmployees.length === 0 && (
            <tr>
              <td colSpan={allDates.length + 2} style={{ textAlign: "center", padding: 20, color: "#999" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* View/Edit Employee Attendance Modal */}
      {selectedEmployee && (
        <div style={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <h3 id="modalTitle" style={{ marginBottom: 15 }}>
              {editMode ? `Edit Attendance for ${selectedEmployee.name}` : `Attendance Details: ${selectedEmployee.name}`}
            </h3>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allDates.map((date) => {
                  const status = editMode
                    ? editAttendance[date] || "Present"
                    : selectedEmployee.attendance[date] || "—";
                  const colorStyle = styles.statusColors[status] || styles.statusColors.Default;
                  return (
                    <tr key={date}>
                      <td style={styles.td}>{date}</td>
                      <td style={{ ...styles.td, ...colorStyle, fontWeight: "bold" }}>
                        {editMode ? (
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(date, e.target.value)}
                            style={{ cursor: "pointer" }}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          status
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {editMode && (
                <button
                  type="button"
                  onClick={saveEdits}
                  style={modalButtonHover ? { ...styles.modalCloseButton, ...styles.modalCloseButtonHover } : styles.modalCloseButton}
                  onMouseEnter={() => setModalButtonHover(true)}
                  onMouseLeave={() => setModalButtonHover(false)}
                >
                  Save
                </button>
              )}
              <button
                type="button"
                onClick={closeModal}
                style={modalButtonHover ? { ...styles.modalCloseButton, ...styles.modalCloseButtonHover } : styles.modalCloseButton}
                onMouseEnter={() => setModalButtonHover(true)}
                onMouseLeave={() => setModalButtonHover(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Employee Modal */}
      {addModalOpen && (
        <div style={styles.modalOverlay} onClick={closeAddModal} role="dialog" aria-modal="true" aria-labelledby="addModalTitle">
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <h3 id="addModalTitle" style={{ marginBottom: 15 }}>
              Add New Employee
            </h3>

            <div style={{ marginBottom: 15 }}>
              <label>
                Name:
                <input
                  type="text"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  style={{ ...styles.input, marginLeft: 10, width: "calc(100% - 60px)" }}
                  autoFocus
                />
              </label>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>
                Department:
                <select
                  value={newEmployeeDepartment}
                  onChange={(e) => setNewEmployeeDepartment(e.target.value)}
                  style={{ ...styles.select, marginLeft: 10 }}
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h4>Attendance Status for Dates</h4>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allDates.map((date) => {
                  const status = newEmployeeAttendance[date] || "Present";
                  return (
                    <tr key={date}>
                      <td style={styles.td}>{date}</td>
                      <td style={styles.td}>
                        <select
                          value={status}
                          onChange={(e) => handleNewEmployeeAttendanceChange(date, e.target.value)}
                          style={{ cursor: "pointer" }}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={saveNewEmployee}
                style={modalButtonHover ? { ...styles.modalCloseButton, ...styles.modalCloseButtonHover } : styles.modalCloseButton}
                onMouseEnter={() => setModalButtonHover(true)}
                onMouseLeave={() => setModalButtonHover(false)}
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeAddModal}
                style={modalButtonHover ? { ...styles.modalCloseButton, ...styles.modalCloseButtonHover } : styles.modalCloseButton}
                onMouseEnter={() => setModalButtonHover(true)}
                onMouseLeave={() => setModalButtonHover(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(50%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Attendance;
