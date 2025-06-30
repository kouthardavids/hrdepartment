import React, { useState, useEffect, useRef } from 'react';
import EmployeeData from '../data/employee_info.json';
import './TimeoffModel.css';

const TIMEOFF_STORAGE_KEY = 'leave_requests';

const Timeoff = () => {
  const [leaveRequests, setLeaveRequests] = useState(() => {
    const stored = localStorage.getItem(TIMEOFF_STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse leave requests from localStorage:", err);
      return [];
    }
  });

  const [employeeData] = useState(EmployeeData.employeeInformation || []);
  const [formData, setFormData] = useState({ name: '', start: '', end: '', reason: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  // Drag and drop refs
  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    localStorage.setItem(TIMEOFF_STORAGE_KEY, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    setSlideIn(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') {
      const found = employeeData.find(emp => emp.name === value);
      setSelectedEmployee(found || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(formData.start) > new Date(formData.end)) {
      alert("End date cannot be before start date.");
      return;
    }

    const newRequest = {
      ...formData,
      status: "Pending",
      date: formData.start
    };

    setLeaveRequests(prev => [...prev, newRequest]);
    setFormData({ name: '', start: '', end: '', reason: '' });
    setSelectedEmployee(null);
    setModalOpen(false);
  };

  const updateStatus = (index, newStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus.toLowerCase()} this request?`
    );
    if (!confirmed) return;

    const updated = [...leaveRequests];
    updated[index].status = newStatus;
    setLeaveRequests(updated);
  };

  const clearAllRequests = () => {
    if (window.confirm("Are you sure you want to clear all leave requests?")) {
      setLeaveRequests([]);
      localStorage.removeItem(TIMEOFF_STORAGE_KEY);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'green';
      case 'Denied': return 'red';
      default: return 'gray';
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    const copyListItems = [...leaveRequests];
    const dragItemContent = copyListItems[dragItem.current];

    // Remove dragged item
    copyListItems.splice(dragItem.current, 1);

    // Insert dragged item at new position
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    setLeaveRequests(copyListItems);
  };

  return (
    <section>
      <div id="app">
        <h2 className="contentWidth mt-4 mb-4" style={{ fontWeight: 600 }}>
          Leave Requests
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="deleteBtn" onClick={clearAllRequests}>Clear All</button>
          <button className="addBtn" onClick={() => setModalOpen(true)}>+ Request Time Off</button>
        </div>
        <br />
        <div
          style={{
            marginBottom: 20,
            fontStyle: "italic",
            color: "#7e289e",
            fontSize: "1rem",
            fontWeight: "bold",
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          * Drag and drop rows to reorder employees as needed.
        </div>

        <table className={`table table-bordered table-striped ${slideIn ? 'slide-in-right' : ''}`}>
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">No leave requests found.</td>
              </tr>
            ) : (
              leaveRequests.map((req, index) => (
                <tr
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()} // Needed to allow drop
                  style={{ cursor: 'grab' }}
                >
                  <td>{req.name}</td>
                  <td>{req.start}</td>
                  <td>{req.end}</td>
                  <td>{req.reason}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getStatusBadgeClass(req.status),
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'Pending' ? (
                      <>
                        <button className="editBtn me-1" onClick={() => updateStatus(index, 'Approved')}>Approve</button>
                        <button className="deleteBtn" onClick={() => updateStatus(index, 'Denied')}>Deny</button>
                      </>
                    ) : '--'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Modal */}
        {modalOpen && (
          <div style={styles.overlay} onClick={() => setModalOpen(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h4>Submit Time Off Request</h4>
              <form onSubmit={handleSubmit}>
                <label>Employee Name</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select employee</option>
                  {employeeData.map(emp => (
                    <option key={emp.employeeId} value={emp.name}>{emp.name}</option>
                  ))}
                </select>

                <label>Start Date</label>
                <input type="date" name="start" value={formData.start} onChange={handleInputChange} style={styles.input} required />

                <label>End Date</label>
                <input type="date" name="end" value={formData.end} onChange={handleInputChange} style={styles.input} required />

                <label>Reason</label>
                <textarea name="reason" rows="3" value={formData.reason} onChange={handleInputChange} style={styles.input} required></textarea>

                {selectedEmployee && (
                  <div style={{ background: '#f1f1f1', padding: 10, borderRadius: 6, marginBottom: 10 }}>
                    <strong>Position:</strong> {selectedEmployee.position}<br />
                    <strong>Department:</strong> {selectedEmployee.department}<br />
                    <strong>Salary:</strong> R{selectedEmployee.salary}<br />
                    <strong>Contact:</strong> {selectedEmployee.contact}<br />
                    <strong>History:</strong> {selectedEmployee.employmentHistory}
                  </div>
                )}

                <button type="submit" style={styles.saveBtn}>Submit</button>
                <button type="button" onClick={() => setModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
    width: '90%',
    maxWidth: 400,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #ccc',
    marginBottom: 10,
  },
  saveBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundImage: 'linear-gradient(#7e289e, #9b59b6)',
    color: 'white',
    marginRight: 10,
  },
  cancelBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: '#95a5a6',
    color: 'white',
  }
};

export default Timeoff;
