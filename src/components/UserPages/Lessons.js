import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import axiosWithAuth from "../Auth/axiosWithAuth";

export default function Lessons(props) {
  const { user, setUser, userLessons, vocab } = props;
  const [addVocab, setAddVocab] = useState([]);
  const [index, setIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState({});
  // const [currentSet, setCurrentSet] = useState([]);
  const history = useHistory();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user.next_lesson && vocab) {
      let userLessons = vocab.filter(
        (word) => word.lesson === user.next_lesson
      );
      console.log("userLessons:", userLessons);
      if (userLessons.length > 0) {
        setCurrentWord(userLessons[index]);
      }
      // setCurrentWord(newUserLessons[index]);
    }
  }, [currentWord, index, user.next_lesson, vocab]);

  function getNextWord(index) {
    setAddVocab([...addVocab, { _id: currentWord._id, rank: 1 }]);
    setIndex(index + 1);
  }

  // console.log("currentSet:", currentSet);

  console.log("currentWord:", currentWord);
  console.log("addVocab:", addVocab);

  function submitVocab() {
    let newVocab = [...addVocab, { _id: currentWord._id, rank: 1 }];
    console.log(token);
    console.log("newVocab:", newVocab);
    axiosWithAuth
      .put("profile", {
        user_vocab: [...user.user_vocab, ...newVocab],
        user_lessons: [user.userLessons],
        // next_lesson: user.next_lesson + 1,
      })
      .then((res) => {
        console.log("res:", res);
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
      {currentWord ? (
        <div className="lesson-box">
          <h3>{currentWord.meaning}</h3>
          <h4>{currentWord.reading}</h4>
          <h4>
            {currentWord.hebrew} / {currentWord.hebrew_with_nikkud}
          </h4>
          <button
            onClick={() =>
              index + 1 < userLessons.length
                ? getNextWord(index)
                : submitVocab()
            }
          >
            Next
          </button>
        </div>
      ) : (
        <p>No Lesson Available</p>
      )}
    </div>
  );
}
