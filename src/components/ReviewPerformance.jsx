import React, { useState, useEffect } from "react";
import './Review.css'

const initialReviews = [
  {
    id: 1,
    name: "Shumeez Van Schalkwyk",
    role: "Software Engineer",
    department: "Engineering",
    performanceRating: "Excellent",
    attendance: "98%",
    projectCompletionRate: "95%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-20",
    reviewer: "Sarah Moyo",
  },
  {
    id: 2,
    name: "Kouthar Davids",
    role: "HR manager",
    department: "HR",
    performanceRating: "Good",
    attendance: "92%",
    projectCompletionRate: "87%",
    peerFeedback: "Neutral",
    reviewDate: "2025-06-18",
    reviewer: "Amir Yusuf",
  },
  {
    id: 3,
    name: "Raeesa Samaai",
    role: "Data Analyst",
    department: "Data Analytics",
    performanceRating: "Outstanding",
    attendance: "100%",
    projectCompletionRate: "99%",
    peerFeedback: "Very Positive",
    reviewDate: "2025-06-15",
    reviewer: "Layla Adams",
  },
  {
    id: 4,
    name: "Aadam Maroof",
    role: " Sales Representitive",
    department: "Sales",
    performanceRating: "Satisfactory",
    attendance: "69%",
    projectCompletionRate: "70%",
    peerFeedback: "Mixed",
    reviewDate: "2025-06-10",
    reviewer: "Noor Smith",
  },
  {
    id: 5,
    name: "zainul Moses",
    role: "Marketing Specialist",
    department: "Marketing",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Zara Mahomed",
  },
  {
    id: 6,
    name: "Ubaidullah Abrahams",
    role: "UI/UX Designer",
    department: "Design",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Aaliyah Mather",
  },
  {
    id: 7,
    name: "Abubakr Gamiet",
    role: "DevOps Engineer",
    department: "IT",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Zeenat Leeman",
  },
  {
    id: 8,
    name: "Mariam Adamms",
    role: "Content Strategist",
    department: "Marketing",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Qasim Isaacs",
  },
  {
    id: 9,
    name: "Ubudullah Aziz",
    role: "Accountant",
    department: "Finance",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Saadiq Jacobs",
  },
  {
    id: 10,
    name: "Fatima Patel",
    role: "Customer support Lead",
    department: "Support",
    performanceRating: "Excellent",
    attendance: "96%",
    projectCompletionRate: "93%",
    peerFeedback: "Positive",
    reviewDate: "2025-06-08",
    reviewer: "Ishmaeel Begg",
  },
];

const ReviewPerformance = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    role: "",
    department: "",
    performanceRating: "",
    attendance: "",
    projectCompletionRate: "",
    peerFeedback: "",
    reviewDate: "",
    reviewer: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 5) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  // Grab 5 reviews from current index (loop around)
  const visibleReviews = [];
  for (let i = 0; i < 5; i++) {
    visibleReviews.push(reviews[(currentIndex + i) % reviews.length]);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    for (const key in newReview) {
      if (newReview[key].trim() === "") {
        alert(`Please fill the ${key} field.`);
        return;
      }
    }
    const newId = reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;
    setReviews([...reviews, { id: newId, ...newReview }]);
    setNewReview({
      name: "",
      role: "",
      department: "",
      performanceRating: "",
      attendance: "",
      projectCompletionRate: "",
      peerFeedback: "",
      reviewDate: "",
      reviewer: "",
    });
    setModalOpen(false);
  };

  return (
    <div className="review-page">
      <h1 className="review-title">Performance Reviews</h1>

      <button className="add-review-btn" onClick={() => setModalOpen(true)}>
        + Add Review
      </button>

      <div className="review-grid">
        {visibleReviews.map((review, idx) => (
          <div
            key={`${review.id}-${currentIndex}`}
            className="review-card slide-in"
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            <h2>{review.name}</h2>
            <p><strong>Role:</strong> {review.role}</p>
            <p><strong>Department:</strong> {review.department}</p>
            <p><strong>Performance Rating:</strong> {review.performanceRating}</p>
            <p><strong>Attendance:</strong> {review.attendance}</p>
            <p><strong>Project Completion:</strong> {review.projectCompletionRate}</p>
            <p><strong>Peer Feedback:</strong> {review.peerFeedback}</p>
            <p><strong>Review Date:</strong> {review.reviewDate}</p>
            <p><strong>Reviewer:</strong> {review.reviewer}</p>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add a New Review</h2>
            <form onSubmit={handleAddReview}>
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Role", name: "role", type: "text" },
                { label: "Department", name: "department", type: "text" },
                { label: "Performance Rating", name: "performanceRating", type: "text" },
                { label: "Attendance", name: "attendance", type: "text", placeholder: "e.g. 95%" },
                { label: "Project Completion Rate", name: "projectCompletionRate", type: "text", placeholder: "e.g. 95%" },
                { label: "Peer Feedback", name: "peerFeedback", type: "text" },
                { label: "Review Date", name: "reviewDate", type: "date" },
                { label: "Reviewer", name: "reviewer", type: "text" },
              ].map(({ label, name, type, placeholder }) => (
                <label key={name} className="modal-label">
                  {label}:
                  <input
                    type={type}
                    name={name}
                    value={newReview[name]}
                    onChange={handleChange}
                    placeholder={placeholder || ""}
                    required
                    className="modal-input"
                  />
                </label>
              ))}
              <div className="modal-buttons">
                <button type="submit" className="modal-btn save-btn">
                  Add Review
                </button>
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPerformance;
