import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axiosWithAuth from "../../Auth/axiosWithAuth";
import {
  alefBetKeys,
  nextArrow,
  regexEnglishPattern,
  regexHebrewPattern,
} from "./ReviewsDataSets";
import {
  randomizeArray,
  nextWord,
  checkLanguageMatch,
  checkAnswer,
  splitReviews,
  checkPair,
  setsOfFive,
} from "./ReviewsFunctions";

export default function Reviews(props) {
  const {
    user,
    setUser,
    vocab,
    availableReviews,
    getAvailableReviews,
    combineArrays,
  } = props;
  const [rankVocab, setRankVocab] = useState(0);
  const [userVocab, setUserVocab] = useState([]);
  const [currentWord, setCurrentWord] = useState({});
  const [removedWord, setRemovedWord] = useState({});
  const [message, setMessage] = useState("");
  const [matched, setMatched] = useState(false);
  const [correctMeaning, setCorrectMeaning] = useState([]);
  const [correctHebrewReading, setCorrectHebrewReading] = useState([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState("");
  const history = useHistory();
  const withNikkud = localStorage.getItem("withNikkud");
  const withPronunciation = localStorage.getItem("withPronunciation");
  const [reviewsLeft, setReviewsLeft] = useState(0);
  const [setsLeft, setSetsLeft] = useState(0);

  useEffect(() => {
    //if the user has vocab and there is vocab available to review and the user vocab has not been set
    if (user.user_vocab && vocab.length > 0 && userVocab.length === 0) {
      //this block is only run once when the page loads
      setMessage(""); //reset the message
      if (availableReviews.length > 0) {
        setReviewsLeft(availableReviews.length);
        //if there are available reviews
        let useVocab = combineArrays(availableReviews, vocab); //combine the user vocab and the vocab into one array
        let userVocab = [];
        let sets = setsOfFive(useVocab); //split the reviews into sets of five
        sets.forEach((set) => {
          //for each set of five reviews call the splitReviews function
          let split = splitReviews(set); //split the reviews into meaning and reading reviews
          //randomize the order of the reviews
          randomizeArray(split);
          randomizeArray(split);
          userVocab = [...userVocab, ...split]; //add the split reviews to the user vocab array
        });
        setUserVocab(userVocab); //set the user voscab to the reviews set array
        setSetsLeft(sets.length);
        setCurrentWord(userVocab[0]); //set the current word to the first word in the array
        setQuestionType(userVocab[0].questionType); //set the meaning type to false
        let correctMeaningArray = userVocab[0].meaning //create an array of the correct meanings of the word by splitting the string of meanings and removing any non-alphabetical characters and converting to lowercase
          .split(", ")
          .map((word) => word.toLowerCase().replace(regexEnglishPattern, ""));
        setCorrectMeaning(correctMeaningArray);
        let correctHebrewReadingArray = userVocab[0].hebrew_without_nikkud //create an array of the correct readings of the word by splitting the string of readings and removing any non-alphabetical characters and converting to lowercase
          .split(", ")
          .map((word) => word.replace(regexHebrewPattern, ""));
        setCorrectHebrewReading(correctHebrewReadingArray);
      } else {
        getAvailableReviews();
      }
    }
    if (userVocab.length > 0) {
      //if there is user vocab
      setCurrentWord(userVocab[0]); //set the current word to the first word in the array
      setQuestionType(userVocab[0].questionType); //set the meaning type to false
      let correctAnswerArray = userVocab[0].meaning //create an array of the correct meanings of the word by splitting the string of meanings and removing any non-alphabetical characters and converting to lowercase
        .split(", ")
        .map((word) => word.toLowerCase().replace(regexEnglishPattern, ""));
      setCorrectMeaning(correctAnswerArray);
      let correctHebrewReadingArray = userVocab[0].hebrew_without_nikkud //create an array of the correct readings of the word by splitting the string of readings and removing any non-alphabetical characters and converting to lowercase
        .split(", ")
        .map((word) => word.replace(regexHebrewPattern, ""));
      setCorrectHebrewReading(correctHebrewReadingArray);
    }
    //eslint-disable-next-line
  }, [user, vocab, removedWord, message]); //if the user, vocab, removedWord, or message changes, run this useEffect

  function handleChange(e) {
    if (!message) {
      //if there is no message then set the answer to the value of the input
      setAnswer(e.target.value);
    } else {
      //otherwise set the answer to the value of the input so that the answer cannot be changed after the message is set
      setAnswer(answer);
    }
  }

  function onCheckAnswer() {
    let message = checkAnswer(
      answer,
      questionType,
      correctHebrewReading,
      correctMeaning
    ); //check the answer
    setMessage(message); //set the message to correct or incorrect
    //if the answer is correct then set the rank change to 1, if the answer is incorrect set it to -1
    // let rankChange = message === "correct" ? 1 : "incorrect" ? -1 : 0;
    let { rankAdjustment, isMatch } = checkPair(currentWord, message);
    setMatched(isMatch);
    if (rankAdjustment < 1) {
      setRankVocab(-1);
    } else {
      setRankVocab(1);
    }
  }

  function getNextWord() {
    let allVocab = user.user_vocab; //set the all vocab to the user vocab array
    if (!message) {
      return allVocab; //if there is no message then return the all vocab array
    }
    setQuestionsAnswered(questionsAnswered + 1); //increment the questions answered
    setMessage(""); //reset the message
    if (matched) {
      setReviewsLeft(reviewsLeft - 1);
      allVocab = nextWord(allVocab, rankVocab, currentWord); //get the next word
    }
    setRemovedWord(userVocab.shift()); //remove the word from the user vocab array and set it to the removed word
    setAnswer(""); //reset the answer
    return allVocab;
  }

  async function submitVocab() {
    checkPair(currentWord, "reset");
    console.log("submitVocab");
    //if there is no current word or no questions answered then return to the dashboard, doing nothing else
    if (!currentWord.questionType || (!message && questionsAnswered === 0)) {
      history.push("/");
      return;
    }
    console.log("vocab:", vocab);
    console.log("userVocab:", userVocab);
    let allVocab = await getNextWord(); //get the next word
    let lessonFiltered = userVocab.filter(
      //filter the all vocab array to only include words from the current lesson
      (word) => word.lesson === user.available_lesson
    );
    let rankFiltered = lessonFiltered.filter((word) => word.rank > 2); //filter the lesson filtered array to only include words with a rank greater than 2
    let lessonToPut;
    let lessonsToPut;
    console.log("rankFiltered:", rankFiltered);
    console.log("lessonFiltered:", lessonFiltered);
    //if the number of words with a rank greater than 2 is greater than or equal to 80% of the number of words in the current lesson then set the lesson to put to the current lesson number plus 1 and set the lessons to put to the vocab filtered to only include words from the lesson to put number
    if (rankFiltered.length / lessonFiltered.length >= 0.8) {
      console.log("here");
      lessonToPut = user.available_lesson + 1;
      lessonsToPut = vocab.filter((word) => word.lesson === lessonToPut);
      lessonsToPut = [...lessonsToPut, ...user.user_lessons];
    } else {
      //otherwise set the lesson to put to the current lesson number and set the lessons to put to the set of user lessons thus not changing the lesson number or adding any new lessons
      lessonToPut = user.available_lesson;
      lessonsToPut = user.user_lessons;
    }

    history.push("/"); //push to the dashboard
    axiosWithAuth //put the user with the updated vocab and lessons
      .put("profile", {
        user_vocab: allVocab,
        user_lessons: lessonsToPut,
        available_lesson: lessonToPut,
      })
      .then((res) => {
        console.log("res:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const onHebrewLetterClick = (e) => {
    let letter = e.target.innerText;
    let newAnswer;
    let input = document.querySelector(".answer-input");
    let answer = input.value;

    if (letter === "space") {
      letter = " ";
    }
    if (letter !== "delete") {
      newAnswer = answer + letter;
    } else {
      newAnswer = answer.slice(0, -1);
    }
    setAnswer(newAnswer);
  };

  return (
    <div className="main-page">
      <div className="review-nav">
        <p className="no-header-dashboard-button" onClick={submitVocab}>
          Dashboard
        </p>
        <p className="toggle">
          Reviews Left: {reviewsLeft} / Sets Left: {setsLeft}
        </p>
      </div>
      {userVocab.length > 0 ? ( //if there is user vocab
        <div className="review-box">
          <div className="review-header">
            {questionType === "meaning" ? (
              <div className="review-meaning">
                <h2>
                  {currentWord.hebrew_without_nikkud}
                  {withNikkud === "true" && currentWord.hebrew_with_nikkud
                    ? ` /${currentWord.hebrew_with_nikkud}`
                    : ""}
                  {/* //if the word has nikkud then display the word with nikkud otherwise display the word without nikkud */}
                </h2>
                {
                  withPronunciation === "true" ? (
                    <h4>"{currentWord.reading}"</h4>
                  ) : null //if the rank vocab is less than 3 then display the reading otherwise display nothing
                }
              </div>
            ) : (
              <div className="review-reading">
                <h2>
                  {currentWord.meaning}
                  {currentWord.gender ? ` (${currentWord.gender[0]})` : ""}
                  {/* //if the current word has a gender then display the first letter of the gender in parentheses after the meaning otherwise display nothing */}
                </h2>
              </div>
            )}
          </div>
          <div
            className={
              //if the message is correct then the input box is green, if the message is incorrect then the input box is red, otherwise the input box is neutral
              message === "correct"
                ? "correct"
                : message === "incorrect"
                ? "incorrect"
                : "neutral"
            }
          >
            <input
              className="answer-input"
              autoFocus="autofocus"
              placeholder={
                //if the meaning type is true then the placeholder is "Enter the meaning" otherwise it is "Enter the reading"
                questionType === "meaning"
                  ? "Enter the meaning"
                  : "Enter the reading"
              }
              name="answer"
              type="text"
              value={answer}
              onChange={handleChange}
              onKeyDown={
                (e) =>
                  e.key === "Enter" && !checkLanguageMatch(answer, questionType) //if the answer does not match the language then do nothing
                    ? null
                    : e.key === "Enter" && userVocab.length > 1 && message //if the user presses enter and there is user vocab and the message is true then get the next word
                    ? getNextWord()
                    : e.key === "Enter" && !message //if the user presses enter and the message is false then check the answer
                    ? onCheckAnswer()
                    : e.key === "Enter" //if the user presses enter and there is no user vocab then submit the vocab
                    ? submitVocab()
                    : null //otherwise do nothing
              }
            />
            <div
              className="message"
              onClick={
                () =>
                  !checkLanguageMatch(answer, questionType) //if the answer does not match the language then do nothing
                    ? null
                    : userVocab.length > 1 && message //if there is user vocab and the message is true then get the next word
                    ? getNextWord()
                    : userVocab.length > 0 && !message //if there is user vocab and the message is false then check the answer
                    ? onCheckAnswer()
                    : submitVocab() //if there is no user vocab then submit the vocab
              }
            >
              {nextArrow}
            </div>
          </div>
          {message && questionType === "meaning" ? (
            <div className="correctAnswer">
              <h3>
                {currentWord.meaning}
                {currentWord.gender ? ` (${currentWord.gender[0]})` : ""}
                {/* //if the current word has a gender then display the first letter of the gender in parentheses after the meaning otherwise display nothing */}
              </h3>
            </div>
          ) : message && questionType === "reading" ? (
            <div className="correctAnswer">
              <h3>
                {currentWord.reading} / {currentWord.hebrew_without_nikkud}
              </h3>
            </div>
          ) : null}

          {questionType === "reading" ? (
            <div className="hebrew-letters">
              {alefBetKeys.map((letter) => {
                return (
                  <p key={letter} onClick={onHebrewLetterClick}>
                    {letter}
                  </p>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        //if there is no user vocab then display the message "No Reviews Available"
        <p>No Reviews Available</p>
      )}
    </div>
  );
}
