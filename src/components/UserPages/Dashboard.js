import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Dashboard = (props) => {
  const { user, vocab, setUserLessons, setUser, userLessons } = props;

  useEffect(() => {
    if (vocab && user.next_lesson) {
      const filtered = vocab.filter((word) => word.lesson === user.next_lesson);
      setUserLessons(filtered);
    }
  }, [vocab, user.next_lesson, setUserLessons]);

  return (
    <div className="main-page">
      {user.user_vocab ? (
        <div className="dashboard-box">
          <h2>Welcome, {user.user_name}!</h2>
          <p>Level: {user.user_level}</p>
          <div className="lessons-reviews-box">
            <div className="lessons-box">
              <NavLink to="/lessons">
                <h3>Lessons: {userLessons.length}</h3>
              </NavLink>
            </div>

            <div className="reviews-box">
              <NavLink to="/reviews">
                <h3>Reviews: {user.user_vocab.length}</h3>
              </NavLink>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
