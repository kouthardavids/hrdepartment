// src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';

import Login from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import TimeoffPage from './pages/TimeoffPage';
import Review from './pages/Review';

function ProtectedRoute() {
  const navigate = useNavigate();
  const userLoggedIn = localStorage.getItem("loggedIn");
  // console.log("userLoggedIn", userLoggedIn);
  
  useEffect(() => {
    if (Boolean(userLoggedIn)) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [userLoggedIn])

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
        {/* using protected route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/timeoff" element={<TimeoffPage />} />
          <Route path="/performance" element={<Review />} />
        </Route>
    </Routes>
  );
}

export default App;
