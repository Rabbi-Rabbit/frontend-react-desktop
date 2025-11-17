import "./App.css";
import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
//Auth
import axiosWithAuth from "./components/Auth/axiosWithAuth";
import AuthForm from "./components/Auth/AuthForm";
import ForgotPasswordPage from "./components/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/Auth/ResetPasswordPage";
//Marketing Pages
import HeaderNav from "./components/MarketingPages/HeaderNav";
import LandingPage from "./components/MarketingPages/LandingPage";
import About from "./components/MarketingPages/About";
import Features from "./components/MarketingPages/Features";
import Pricing from "./components/MarketingPages/Pricing";
import Help from "./components/MarketingPages/Help";
//User Pages
import AuthorizedNav from "./components/UserPages/AuthorizedNav";
import Dashboard from "./components/UserPages/Dashboard";
import Vocabulary from "./components/UserPages/Vocabulary";
import Study from "./components/UserPages/Study";
import Library from "./components/UserPages/Library";
import AddNewText from "./components/UserPages/AddNewText";
import Account from "./components/UserPages/AccountPages/Account";
import Lessons from "./components/UserPages/Lessons";
import Reviews from "./components/UserPages/Reviews/ReviewsPage";

function App() {
  const location = useLocation();
  
  //initialize auth state based on token presence to prevent flashing
  const [auth, setAuth] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [user, setUser] = useState({});
  const [userLessons, setUserLessons] = useState([]);
  const [vocab, setVocab] = useState([]);
  const [lesson1, setLesson1] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [availableReviews, setAvailableReviews] = useState([]);

  // routes where navigation should be hidden
  const routesWithoutNav = ["/lessons", "/reviews"];

  // determine if nav should be shown based on current route
  const showNav = !routesWithoutNav.includes(location.pathname);

  useEffect(() => {
    getVocab(); //runs on page load
    validateToken(); //validate token on app load
    //eslint-disable-next-line
  }, []); //run this function once on mount

  useEffect(() => {
    //if auth is true but user data is not loaded, fetch user data
    if (auth && (!user || !user._id)) {
      getUser();
    }
    //eslint-disable-next-line
  }, [auth]); //run when auth changes

  useEffect(() => {
    //if user data is loaded and user has vocab, get available reviews
    if (auth && user.user_vocab && user.user_vocab.length > 0) {
      getAvailableReviews(); //get the available reviews
    }
    //eslint-disable-next-line
  }, [user.user_vocab, auth]); //run when user vocab changes

  function getVocab() {
    axiosWithAuth //get the vocab from the server
      .get("vocab")
      .then((res) => {
        setVocab(res.data); //set the vocab to the response data
        //set lesson1 to all words with a lesson number of 1
        let lesson1set = res.data.filter((word) => word.lesson === 1);
        setLesson1(lesson1set);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function validateToken() {
    const token = localStorage.getItem("token");
    if (token) {
      //if there is a token, validate it by fetching user data
      axiosWithAuth
        .get("profile") //hitting the profile endpoint
        .then((res) => {
          //token is valid, set auth to true and user data
          setUser(res.data); //set the user to the response data
          setAuth(true); //set auth to true after successful validation
        })
        .catch((err) => {
          //token is invalid or expired
          console.log("Token validation failed:", err);
          localStorage.removeItem("token"); //remove invalid token
          setAuth(false); //set auth to false
          setUser({}); //clear user data
        });
    } else {
      //no token found
      setAuth(false); //set auth to false
    }
  }

  function getUser() {
    const token = localStorage.getItem("token");
    if (token) {
      //if there is a token
      axiosWithAuth //get the user data from the server
        .get("profile") //hitting the profile endpoint
        .then((res) => {
          setUser(res.data); //set the user to the response data
        })
        .catch((err) => {
          //if request fails, token might be invalid
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem("token"); //remove invalid token
            setAuth(false); //set auth to false
            setUser({}); //clear user data
          }
          console.log(err);
        });
    }
  }

  function getAvailableReviews() {
    //get the available reviews
    //filter the user vocab to only include words that are ready for review
    //by comparing the next review date to today's date
    //and only return the words that have a next review date that is less than or equal to today
    //set the available reviews to the filtered array
    let reviews = user.user_vocab.filter((word) => {
      if (word.next_review === null) {
        return false;
      }
      let today = new Date();
      let nextReview = new Date(word.next_review);
      return nextReview <= today;
    });
    setAvailableReviews(reviews);
  }

  function combineArrays(array1, array2) {
    //combine the two arrays into one array where they have the same _id
    let combinedArray = [];
    array1.forEach((item1) => {
      array2.forEach((item2) => {
        if (item1._id === item2._id) {
          combinedArray.push({ ...item1, ...item2 }); //combine the two objects into one object
        }
      });
    });
    return combinedArray;
  }

  const navToUse =
    auth && showNav ? ( //if auth is true and showNav is true
      <AuthorizedNav setAuth={setAuth} /> //use the AuthorizedNav
    ) : showNav ? ( //if showNav is true
      <HeaderNav /> //use the HeaderNav
    ) : null; //if showNav is false, don't use a nav

  const landingPage = auth ? ( // if auth is true
    <Dashboard //use the Dashboard component
      user={user}
      setUser={setUser}
      setUserLessons={setUserLessons}
      userLessons={userLessons}
      availableReviews={availableReviews}
      getAvailableReviews={getAvailableReviews}
    />
  ) : (
    //if auth is false use the LandingPage component
    <LandingPage />
  );

  return (
    <div className="App">
      {navToUse}
      <Switch>
        {/* Marketing Pages */}
        <Route exact path="/">
          {landingPage}
        </Route>
        <Route path="/about" component={About} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/help" component={Help} />
        {/* Auth Pages */}
        <Route path="/auth/:auth">
          <AuthForm setAuth={setAuth} lesson1={lesson1} />
        </Route>
        <Route path="/forgot">
          <ForgotPasswordPage />
        </Route>
        <Route path="/reset-password">
          <ResetPasswordPage />
        </Route>
        {/* User Pages */}
        <Route path="/vocab">
          <Vocabulary
            vocab={vocab}
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
          />
        </Route>
        <Route path="/study" component={Study} />
        <Route path="/library" component={Library} />
        {/* <Route path="/add-new-text" component={AddNewText} /> */}
        <Route path="/add-new-text">
          <AddNewText vocab={vocab} user={user} combineArrays={combineArrays} />
        </Route>
        <Route path="/account">
          <Account
            user={user}
            setUser={setUser}
            setAuth={setAuth}
            lesson1={lesson1}
          />
        </Route>
        <Route path="/lessons">
          <Lessons
            user={user}
            setUser={setUser}
            vocab={vocab}
          />
        </Route>
        <Route path="/reviews">
          <Reviews
            user={user}
            setUser={setUser}
            vocab={vocab}
            availableReviews={availableReviews}
            getAvailableReviews={getAvailableReviews}
            combineArrays={combineArrays}
          />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
