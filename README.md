# Rabbi-Rabbit

### An app designed to supplement Hebrew language learning by providing a simple yet engaging way to review vocabulary.

Rabbi-Rabbit helps learners of the Hebrew language through a clean and interactive app that uses direct input for review questions and implements a spaced repetition system.

## 🌐 [Live Website](https://www.rabbi-rabbit.com/)

---

## Quicklinks

- [Related Repos](#related-repos)
- [Tech Stack](#tech-stack)
- [Useful Resources](#useful-resources)
- [Project MVP Features](#project-mvp-features)
  - [Authorization](#authorization)
  - [Dashboard](#dashboard)
  - [Lessons](#lessons)
  - [Reviews](#reviews)
  - [Vocabulary](#vocabulary)
  - [Account Settings](#account-settings)
  - [Danger Zone](#danger-zone)
- [Features for Future Release](#features-for-future-release)
  - [Audio Clips](#audio-clips)
  - [Monthly Subscription](#monthly-subscription)

---

## Related Repos

- [Desktop Web App](https://github.com/Rabbi-Rabbit/frontend-react-desktop)
- [Mongo Database and Server](https://github.com/Rabbi-Rabbit/mongo-db-node-server)

---

## Tech Stack

- React  
- JavaScript  
- CSS  
- Validation with Yup  
- Testing with React Testing Library _(coming soon)_

---

## Useful Resources

- [Contribution Guidelines](https://github.com/Grow-Work/.github/blob/main/GENERAL-CONTRIBUTING.md)
- [Markdown Basics](https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- [MongoDB University](https://university.mongodb.com/learning_paths/developer)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Tutorial](https://reactjs.org/tutorial/tutorial.html)

---

## Project MVP Features

Minimum viable product features across the entire project: desktop frontend, mobile frontend, and backend server.

### Authorization

- **Sign Up**  
  - Creates a new user with level 1, first lesson set, email, and hashed password.

- **Sign In**  
  - Redirects to the dashboard and updates nav items.

- **Sign Out**  
  - Redirects to the landing page and resets nav items.

- **Password Reset**  
  - Sends a reset pin to the user’s email. If the correct pin, email, and new password are entered, the password is updated and the user is redirected to login.

---

### Dashboard

- Buttons with counts for available Lessons and Reviews  
- Displays next available review date/time  
- Mastery progress bar for the current level

---

### Lessons

- Displays Hebrew, Hebrew with nikkud, pronunciation, and meaning (word or phrase)
- Viewing lessons adds them to the reviews list with rank 1 (“New”) and makes them available for review immediately
- Forward/backward navigation through lessons
- New lessons are unlocked when 80% of the current set reaches mastery rank 3+
- New lessons are added to existing lesson lists

---

### Reviews

- Randomizes available reviews  
- Direct input for answers  
- Built-in Hebrew “keyboard” for reading input  
- Language detection and enforcement  
- Gives feedback (correct/incorrect) and shows correct answer  
- Requires correct meaning **and** reading to rank up  
- Items answered incorrectly are ranked down (unless already at minimum rank)  
- Next review date calculated using spaced repetition based on new rank  
- Completing all reviews or clicking Dashboard submits vocab item data

---

### Vocabulary

- View vocab by level  
- Only shows vocabulary unlocked or reviewed by the user  
- Displays: Hebrew, nikkud, meaning, pronunciation, level, and mastery rank

---

### Account Settings

- Checkbox: Show nikkud during reviews  
- Checkbox: Show pronunciation during reviews  
- Settings saved in localStorage

---

### Danger Zone

- Reset all learning progress  
- Delete account

---

## Features for Future Release

Planned additions for all platforms.

### Audio Clips

- Listen to native speakers pronounce each vocabulary item.

### Monthly Subscription

- Paid access model beyond level 3.

---

## Got ideas for more features?  
📬 Reach out — I’d love to hear from you!
