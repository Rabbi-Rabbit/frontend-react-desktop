import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axiosWithAuth from "../Auth/axiosWithAuth";

export default function Lessons(props) {
  const { user, setUser, vocab } = props;
  const [index, setIndex] = useState(0);
  const [addVocab, setAddVocab] = useState([]);
  const [userLessons, setUserLessons] = useState([]);
  const [moveLessons, setMoveLessons] = useState([]);
  const [currentWord, setCurrentWord] = useState({});
  const [lessonsViewed, setLessonsViewed] = useState(0);
  const history = useHistory();
  let nextArrow = ">";
  let previousArrow = "<";

  useEffect(() => {
    // if the user lessons array is not empty and the vocab array is not empty and the userLessons array is empty
    if (user.user_lessons && vocab.length > 0 && userLessons.length === 0) {
      // filter the vocab array to only include words that are in the user lessons array based on the id
      let lessons = vocab.filter((word) =>
        user.user_lessons.includes(word._id)
      );
      setUserLessons(user.user_lessons);
      setMoveLessons(lessons);
      setCurrentWord(moveLessons[index]);
    }
    if (userLessons.length > 0) {
      // if the userLessons array is not empty
      setCurrentWord(moveLessons[index]); // set the current word to the word at the index of the moveLessons array
    }
    //eslint-disable-next-line
  }, [user, vocab, addVocab, index, userLessons]);

  function getNextWord() {
    if (index < lessonsViewed) {
      // if the index is less than the number of lessons viewed
      setIndex(index + 1); // increment the index by 1 then exit the function
      return;
    }
    setAddVocab([
      ...addVocab, // add the current word to the addVocab array
      {
        _id: currentWord._id,
        rank: 0,
        lesson_number: currentWord.lesson,
        next_review: new Date(),
      },
    ]);
    userLessons.shift(); // remove the current word from the userLessons array
    setIndex(index + 1); // increment the index by 1
    setLessonsViewed(lessonsViewed + 1); // increment the number of lessons viewed by 1
  }

  function submitVocab() {
    // if there is no current word or the number of lessons viewed is 0
    if (!currentWord || lessonsViewed === 0) {
      history.push("/"); // redirect to the dashboard
      return; // exit the function
    }
    let newVocab = [
      ...addVocab, // add the current word to the addVocab array
      {
        _id: currentWord._id,
        rank: 0,
        lesson_number: currentWord.lesson,
        next_review: new Date(),
      },
    ];
    userLessons.shift(); // remove the current word from the userLessons array

    axiosWithAuth // update the user profile with the new vocab and userLessons arrays
      .put("profile", {
        user_vocab: [...user.user_vocab, ...newVocab],
        user_lessons: userLessons,
      })
      .then((res) => {
        console.log("res:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        history.push("/");
      });
  }

  return (
    <div className="main-page">
      <p className="no-header-dashboard-button" onClick={submitVocab}>
        Dashboard
      </p>
      {currentWord ? (
        <div className="lesson-box">
          {index > 0 ? ( // if the index is greater than 0 display the previous arrow
            <div className="arrow" onClick={() => setIndex(index - 1)}>
              {previousArrow}
            </div>
          ) : (
            // if the index is not greater than 0 display the previous arrow as disabled
            <div className="arrow disabled">{previousArrow}</div>
          )}
          <div className="lesson-text">
            <h2>{currentWord.hebrew_without_nikkud}</h2>
            <h4>{currentWord.hebrew_with_nikkud}</h4>
            <h4>"{currentWord.reading}"</h4>
            <h4>
              {currentWord.meaning}
              {currentWord.gender ? ` (${currentWord.gender[0]})` : ""}
              {/* //if the current word has a gender then display the first letter of the gender in parentheses after the meaning otherwise display nothing */}
            </h4>
          </div>
          <div
            className="arrow"
            onClick={
              () => (userLessons.length > 1 ? getNextWord() : submitVocab())
              // if the userLessons array is greater than 1 then call the getNextWord function otherwise call the submitVocab function
            }
          >
            {nextArrow}
          </div>
        </div>
      ) : (
        // if there is no current word display the message "No Lessons Available"
        <p>No Lessons Available</p>
      )}
    </div>
  );
}
