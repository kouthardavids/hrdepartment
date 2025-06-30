import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './DashboardContent.css';
import { Pie, Bar } from 'react-chartjs-2';
import SideBar from './SideBar';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function DashboardContent({
  totalEmployees,
  overallAttendancePercent,
  totalPayroll,
  timeOffCounts,
  employeeCategories = { fullTime: 60, partTime: 30, contractors: 10 }
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [countEmployees, setCountEmployees] = useState(0);
  const [countAttendance, setCountAttendance] = useState(0);
  const [countPayroll, setCountPayroll] = useState(0);
  const location = useLocation();

  const toggleSidebar = () => setSidebarExpanded(!sidebarExpanded);

  // Animated Counters
  useEffect(() => {
    let frame, current = 0;
    const increment = totalEmployees / (2000 / 16);
    const animate = () => {
      current += increment;
      if (current < totalEmployees) {
        setCountEmployees(Math.floor(current));
        frame = requestAnimationFrame(animate);
      } else {
        setCountEmployees(totalEmployees);
        cancelAnimationFrame(frame);
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [totalEmployees]);

  useEffect(() => {
    let frame, current = 0;
    const increment = overallAttendancePercent / (2000 / 16);
    const animate = () => {
      current += increment;
      if (current < overallAttendancePercent) {
        setCountAttendance(Math.floor(current));
        frame = requestAnimationFrame(animate);
      } else {
        setCountAttendance(overallAttendancePercent);
        cancelAnimationFrame(frame);
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [overallAttendancePercent]);

  useEffect(() => {
    let frame, current = 0;
    const increment = totalPayroll / (2000 / 16);
    const animate = () => {
      current += increment;
      if (current < totalPayroll) {
        setCountPayroll(Math.floor(current));
        frame = requestAnimationFrame(animate);
      } else {
        setCountPayroll(totalPayroll);
        cancelAnimationFrame(frame);
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [totalPayroll]);

  const messages = [
    "📢 Reminder: Submit your monthly reports.",
    "📝 Update: New HR policies have been released.",
    "💡 Tip: Attend the upcoming training session.",
    "📅 Note: Annual leave requests close next week.",
    "🔔 Announcement: Team meeting scheduled for Friday.",
    "⚠️ Please complete your performance reviews by end of month."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(i => (i + 1) % messages.length);
        setFade(true);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const pieData = {
    labels: ['Full-Time', 'Part-Time', 'Contractors'],
    datasets: [{
      label: 'Employee Breakdown',
      data: [
        employeeCategories.fullTime,
        employeeCategories.partTime,
        employeeCategories.contractors
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#393739' }
      }
    }
  };

  const barData = {
    labels: ['Full-Time', 'Part-Time', 'Contractors'],
    datasets: [{
      label: 'Employees Count',
      data: [
        employeeCategories.fullTime,
        employeeCategories.partTime,
        employeeCategories.contractors
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { color: '#393739' } },
      x: { ticks: { color: '#393739' } }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="d-flex">
      <SideBar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

      <section className={`contentWidth flex-grow-1 ${sidebarExpanded ? 'expanded' : ''}`}>
        <div className="container-fluid mt-4 text-start">
          <div className="mb-3 animationTop">
            <h2 className="fw-semibold">Main Dashboard</h2>
          </div>

          <div className="row">
            {/* LEFT COLUMN */}
            <div className="col-lg-8 col-12 p-3 animationLeft">
              <h4>Overview</h4>
              <div className="row g-3 mt-2">
                {[
                  { icon: "fa-users", value: countEmployees, label: "Total Employees" },
                  { icon: "fa-percent", value: `${countAttendance}%`, label: "Attendance Percentage" },
                  { icon: "fa-money-bill-transfer", value: `R${countPayroll}`, label: "Total Monthly Payroll" }
                ].map((card, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <div className="dashboard-content stat-card p-3 text-start h-100">
                      <i className={`fa-solid ${card.icon} mb-3 p-1 icon-purple`}></i>
                      <div className="stat-number">{card.value}</div>
                      <h5 className="stat-label fw-semibold pt-2 mb-2">{card.label}</h5>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4>Employee Breakdown</h4>
                <div className="dashboard-content p-4 mt-3">
                  <div className="row g-3">
                    <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
                      <div className="w-100" style={{ maxWidth: '300px', height: '280px' }}>
                        <Pie data={pieData} options={pieOptions} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
                      <div className="w-100" style={{ maxWidth: '300px', height: '280px' }}>
                        <Bar data={barData} options={barOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-lg-4 col-12 p-3 animationRight">
              <h4>Time-off Requests</h4>
              {[
                { label: 'Pending', value: timeOffCounts.pending, gradient: '#f69610, #fbc100' },
                { label: 'Approved', value: timeOffCounts.approved, gradient: '#38a638, #89e789' },
                { label: 'Denied', value: timeOffCounts.denied, gradient: '#c82c26, #dd7470' },
              ].map((card, i) => (
                <div key={i} className="dashboard-content p-3 mb-3" style={{ backgroundImage: `linear-gradient(${card.gradient})` }}>
                  <h5 className="fw-bold">{card.label}</h5>
                  <p>{card.value}</p>
                </div>
              ))}

              <h4 className="mt-4">Reminders</h4>
              <div className="dashboard-content p-3 mt-3 mb-3" style={{ minHeight: '80px' }}>
                <h5
                  style={{
                    opacity: fade ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    margin: 0
                  }}
                >
                  {messages[currentIndex]}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardContent;
