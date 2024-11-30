/*

This script is activated when user clicks the extension icon.

Code that's run automatically:
Checks whether any previous breaks are going on (manages styles for popup + logic accordingly)
Checks for the previous saved break time and then loads it up for displaying on front end

Other stuff in the script:
Break timer logic is there, taking inputs from user to start break etc

*/

import { set_break_settings, get_break_settings } from "./background.js";

const ONE_HOUR = 3600;
const ONE_MINUTE = 60;
const ONE_SECOND = 1000;

const BREAK_NOT_STARTED = 0;
const BREAK_STARTED = 1;
const BREAK_ONGOING = 2

let time_value = document.getElementById("timeInput").value; // Time input field value
let break_time_value = 0; // The current value of break time in minutes
let quitYt = document.getElementById("quitYt"); // Quit yt automatically whole menu
let currentTime = document.getElementById("currentTime"); // Text which displays break time when setting it up
let breakStatus = 0 // 0 means not started, 1 means started, 2 means it is ongoing
let get_break_time = 0;
let remainingTime = 0;
let timerInterval;
// Settings are hidden by default, only visible when "enable break" is pressed
timeSettings.style.visibility = "hidden";
quitYt.style.visibility = "hidden";

// Loading prev saved break time for front end
function currentTimeText(new_time) {
  currentTime.innerText = "Break settings will be applied for: " + new_time + " min";
  break_time_value = Number(new_time);
}
chrome.storage.local.get().then(breakSettings => {
  currentTimeText(breakSettings.break_time);
});

function calculateTimeDifferenceInSeconds(date1, date2) {
  const differenceInMilliseconds = date1.getTime() - date2.getTime();
  const differenceInSeconds = Math.floor(differenceInMilliseconds / ONE_SECOND);
  return differenceInSeconds;
}

// Fetches break's start time and current time. Then returns difference
function checkRemainingTime() {
  const currentDate = new Date();
  const startDate = new Date(localStorage.getItem("start time"));
  console.log("currentdate", currentDate)
  console.log("startDate", startDate)
  return calculateTimeDifferenceInSeconds(currentDate, startDate);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / ONE_HOUR);
  const remainingSeconds = seconds % ONE_HOUR;
  const minutes = Math.floor(remainingSeconds / ONE_MINUTE);
  const seconds2 = seconds - (minutes * ONE_MINUTE) - (hours * ONE_HOUR);
  
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds2).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function updateTimer(dontReduceTime = false) {
  // Note: remaining time is the time remaining for break
  if (remainingTime > ONE_HOUR) {
    get_break_time = formatTime(remainingTime);
  } else {
    const minutes = Math.floor(remainingTime / ONE_MINUTE);
    const seconds = remainingTime % ONE_MINUTE;
    get_break_time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  document.getElementById("break").innerText = get_break_time;

  if (!dontReduceTime) {
    remainingTime--;
  }

  if (remainingTime < 0) {
    clearInterval(timerInterval);
    // Break over, removing stored data
    localStorage.removeItem("start time");
    initial_break_style();
    breakStatus = BREAK_NOT_STARTED;
  }
}


// On start of popup, checks whether break is ongoing or not
// If ongoing, starts timer by calling updateTimer every second
chrome.storage.local.get().then(breakSettings => {
  console.log("ongoing value, popup: ", breakSettings.ongoing);
  if (breakSettings.ongoing) {
    if (checkRemainingTime() < (breakSettings.break_time * ONE_MINUTE)) {
      breakStatus = BREAK_ONGOING;
      remainingTime = (breakSettings.break_time * ONE_MINUTE) - checkRemainingTime();
      updateTimer();

      // console.log("break time value: ", breakSettings.break_time);
      // console.log("check remaining time function", checkRemainingTime())
      // console.log("remaining time", remainingTime);

      document.getElementById("break").style.backgroundColor = "#B0301F"
      document.getElementById("break").style.color = "white";
      timerInterval = setInterval(updateTimer, ONE_SECOND);
    } else {
      // Break over, removing stored data
      localStorage.removeItem("start time");
    }
  }
});

// Handling input for break time
document.getElementById("timeInput").addEventListener("input", function (event) {
  let input = event.target.value;

  // Use a regular expression to allow only numeric input
  let numericInput = input.replace(/[^0-9]/g, '');

  // Limit the input to 3 digits
  if (numericInput.length > 3) {
    numericInput = numericInput.slice(0, 3);
  }

  event.target.value = numericInput;

})

// Handling "user clicked submit icon" for new break time
document.getElementById("submitTime").addEventListener("click", function (event) {
  time_value = document.getElementById("timeInput").value;
  if (time_value == "" || time_value == null) {
    time_value = "10"
  }
  currentTimeText(time_value);
});

function initial_break_style() {
  timeSettings.style.visibility = "visible";
  quitYt.style.visibility = "visible";

  document.getElementById("break").innerText = "Start break";
  document.getElementById("break").style.backgroundColor = "#61C954"
  document.getElementById("break").style.color = "black";
}

// Handles the styles of the popup's front end depending on if break is ongoing or nah
document.getElementById("break").addEventListener("click", async function (event) {
  let timeSettings = document.getElementById("timeSettings");

  if (breakStatus == BREAK_NOT_STARTED) {
    initial_break_style();
    breakStatus = BREAK_STARTED;

  } else if (breakStatus == BREAK_STARTED) {
    timeSettings.style.visibility = "hidden";
    quitYt.style.visibility = "hidden";
    await set_break_settings(break_time_value, document.getElementById("quitInput").checked, true);

    document.getElementById("break").style.backgroundColor = "#B0301F";
    document.getElementById("break").style.color = "white";
    breakStatus = BREAK_ONGOING;
    chrome.runtime.sendMessage({action: "start", value: break_time_value});
    localStorage.setItem("start time", new Date());
    remainingTime = break_time_value * ONE_MINUTE;
    timerInterval = setInterval(updateTimer, ONE_SECOND); // Update every second    

  }
})