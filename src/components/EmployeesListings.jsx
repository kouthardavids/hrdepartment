import React, { useState, useEffect, useRef } from 'react';
import employeeInfo from '../data/employee_info.json';
import './EmployeesListings.css';

const LOCAL_STORAGE_KEY = 'employees_data';
const employmentTypeOptions = ['Full-Time', 'Part-Time', 'Contractor'];

const EmployeesListings = () => {
  const [employees, setEmployees] = useState(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return employeeInfo.employeeInformation;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    contact: '',
    salary: '',
    employmentType: '',
  });

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => setSlideIn(true), []);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  // Validation: contact can be phone number or email
  const validate = (emp) => {
    const errors = {};
    if (!emp.name.trim()) errors.name = 'Name is required';
    if (!emp.position.trim()) errors.position = 'Position is required';

    if (!emp.contact.trim()) {
      errors.contact = 'Contact is required';
    } else {
      const phoneRegex = /^[0-9\-\+]{9,15}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!phoneRegex.test(emp.contact) && !emailRegex.test(emp.contact)) {
        errors.contact = 'Must be a valid phone number or email';
      }
    }

    if (!emp.salary.toString().trim()) errors.salary = 'Salary is required';
    else if (isNaN(Number(emp.salary))) errors.salary = 'Salary must be a number';

    if (!employmentTypeOptions.includes(emp.employmentType)) {
      errors.employmentType = 'Select a valid employment type';
    }
    return errors;
  };

  const handleAdd = () => {
    const errors = validate(newEmployee);
    if (Object.keys(errors).length) return setAddErrors(errors);

    const newId = employees.length ? Math.max(...employees.map(e => e.employeeId)) + 1 : 1;
    const newEmp = { ...newEmployee, employeeId: newId, salary: Number(newEmployee.salary) };
    setEmployees([...employees, newEmp]);
    setNewEmployee({ name: '', position: '', contact: '', salary: '', employmentType: '' });
    setAddErrors({});
    setModalOpen(false);
  };

  const handleSaveEdit = () => {
    const errors = validate(editingEmployee);
    if (Object.keys(errors).length) {
      setEditErrors(errors);
      return;
    }

    setEmployees((prev) =>
      prev.map(emp =>
        emp.employeeId === editingEmployee.employeeId
          ? {
              ...editingEmployee,
              salary: Number(editingEmployee.salary),
            }
          : emp
      )
    );
    setEditErrors({});
    setEditingEmployee(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this employee?')) {
      setEmployees(employees.filter(emp => emp.employeeId !== id));
    }
  };

  const handleDragStart = (e, index) => dragItem.current = index;
  const handleDragEnter = (e, index) => dragOverItem.current = index;

  const handleDragEnd = () => {
    const list = [...employees];
    const item = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, item);

    // Update employeeId to match new index + 1
    const updatedList = list.map((emp, idx) => ({
      ...emp,
      employeeId: idx + 1,
    }));

    setEmployees(updatedList);
    dragItem.current = dragOverItem.current = null;
  };

  return (
    <section>
      <div id="app">
        <h2 className="contentWidth mt-4 mb-2" style={{ fontWeight: 600 }}>Employees List</h2>

        <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 'bold' }}>
          Total Employees: {employees.length}
        </div>

        <button className="addBtn" onClick={() => setModalOpen(true)}>Add Employee</button>

        <div style={{ margin: '16px 0', fontStyle: 'italic', color: '#7e289e', fontWeight: 'bold' }}>
          * Drag and drop rows to reorder employees.
        </div>

        <table className={`table table-bordered table-striped ${slideIn ? 'slide-in-right' : ''}`}>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Contact</th>
              <th>Salary</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No employees found.</td></tr>
            ) : (
              employees.map((emp, index) => (
                <tr
                  key={emp.employeeId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ cursor: 'grab' }}
                >
                  <td>{emp.employeeId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td>{emp.contact}</td>
                  <td>{emp.salary}</td>
                  <td>{emp.employmentType}</td>
                  <td className="actions-cell">
                    <button className="btn" onClick={() => setViewingEmployee(emp)}>View</button>
                    <button className="editBtn" onClick={() => setEditingEmployee({ ...emp })}>Edit</button>
                    <button className="deleteBtn" onClick={() => handleDelete(emp.employeeId)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {modalOpen && (
          <Modal title="Add New Employee" onClose={() => setModalOpen(false)}>
            {['name', 'position', 'contact', 'salary'].map((field) => (
              <div key={field}>
                <input
                  style={styles.input}
                  placeholder={field}
                  value={newEmployee[field]}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                />
                {addErrors[field] && <div style={styles.error}>{addErrors[field]}</div>}
              </div>
            ))}
            <select
              style={styles.input}
              value={newEmployee.employmentType}
              onChange={(e) =>
                setNewEmployee((prev) => ({ ...prev, employmentType: e.target.value }))
              }
            >
              <option value="">Select Employment Type</option>
              {employmentTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {addErrors.employmentType && <div style={styles.error}>{addErrors.employmentType}</div>}

            <button style={styles.saveBtn} onClick={handleAdd}>Add</button>
            <button style={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancel</button>
          </Modal>
        )}

        {viewingEmployee && (
          <Modal title="Employee Details" onClose={() => setViewingEmployee(null)}>
            <p><strong>Name:</strong> {viewingEmployee.name}</p>
            <p><strong>Position:</strong> {viewingEmployee.position}</p>
            <p><strong>Contact:</strong> {viewingEmployee.contact}</p>
            <p><strong>Salary:</strong> {viewingEmployee.salary}</p>
            <p><strong>Type:</strong> {viewingEmployee.employmentType}</p>
            <button style={styles.cancelBtn} onClick={() => setViewingEmployee(null)}>Close</button>
          </Modal>
        )}

        {editingEmployee && (
          <Modal title="Edit Employee" onClose={() => setEditingEmployee(null)}>
            {['name', 'position', 'contact', 'salary'].map((field) => (
              <div key={field}>
                <input
                  style={styles.input}
                  placeholder={field}
                  value={editingEmployee[field]}
                  onChange={(e) =>
                    setEditingEmployee((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                />
                {editErrors[field] && <div style={styles.error}>{editErrors[field]}</div>}
              </div>
            ))}
            <select
              style={styles.input}
              value={editingEmployee.employmentType}
              onChange={(e) =>
                setEditingEmployee((prev) => ({ ...prev, employmentType: e.target.value }))
              }
            >
              <option value="">Select Employment Type</option>
              {employmentTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {editErrors.employmentType && <div style={styles.error}>{editErrors.employmentType}</div>}

            <button style={styles.saveBtn} onClick={handleSaveEdit}>Save</button>
            <button style={styles.cancelBtn} onClick={() => setEditingEmployee(null)}>Cancel</button>
          </Modal>
        )}
      </div>
    </section>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div style={styles.overlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h4>{title}</h4>
      {children}
    </div>
  </div>
);

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
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
};

export default EmployeesListings;
