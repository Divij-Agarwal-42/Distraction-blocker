import { set_break_settings, get_break_settings } from "./background.js";

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

function currentTimeText(new_time) {
  currentTime.innerText = "Break settings will be applied for: " + new_time + " min";
  break_time_value = Number(new_time);
}

get_break_settings().then(breakSettings => {
  currentTimeText(breakSettings.break_time);
});

function calculateTimeDifferenceInSeconds(date1, date2) {
  const differenceInMilliseconds = date1.getTime() - date2.getTime();
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
  return differenceInSeconds;
}

function checkRemainingTime() {
  const currentDate = new Date();
  const startDate = new Date(localStorage.getItem("start time"));
  console.log("currentdate", currentDate)
  console.log("startDate", startDate)
  return calculateTimeDifferenceInSeconds(currentDate, startDate);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
}

function updateTimer(dontReduceTime = false) {
  if (remainingTime > 3600) {
    get_break_time = formatTime(remainingTime);
  } else {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
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
    breakStatus = 0;
  }
}


// On start of popup, checks whether break is ongoing or not
get_break_settings().then(breakSettings => {
  if (breakSettings.ongoing) {
    if (checkRemainingTime() < (breakSettings.break_time * 60)) {
      breakStatus = 2;
      remainingTime = (breakSettings.break_time * 60) - checkRemainingTime();
      updateTimer(true); // Just for getting the time value, doesn't affect time

      console.log("break time value: ", breakSettings.break_time);
      console.log("check remaining time function", checkRemainingTime())
      console.log("remaining time", remainingTime);

      document.getElementById("break").style.backgroundColor = "#B0301F"
      document.getElementById("break").style.color = "white";
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      // Break over, removing stored data
      localStorage.removeItem("start time");
    }
  }
});

document.getElementById("timeInput").addEventListener("input", function (event) {
  let input = event.target.value;

  // Use a regular expression to allow only numeric input
  let numericInput = input.replace(/[^0-9]/g, '');

  // Limit the input to 3 digits
  if (numericInput.length > 4) {
    numericInput = numericInput.slice(0, 4);
  }

  event.target.value = numericInput;

})

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

document.getElementById("break").addEventListener("click", async function (event) {
  let timeSettings = document.getElementById("timeSettings");

  if (breakStatus == 0) { // Break is going to start, settings are being selected
    initial_break_style();
    breakStatus = 1;

  } else if (breakStatus == 1) { // Break is starting
    timeSettings.style.visibility = "hidden";
    quitYt.style.visibility = "hidden";
    await set_break_settings(break_time_value, document.getElementById("quitInput").checked, true);

    document.getElementById("break").style.backgroundColor = "#B0301F";
    document.getElementById("break").style.color = "white";
    breakStatus = 2;
    chrome.runtime.sendMessage({action: "start", value: break_time_value});
    localStorage.setItem("start time", new Date());
    remainingTime = break_time_value * 60;
    timerInterval = setInterval(updateTimer, 1000); // Update every second    

  }
})

// chrome.runtime.sendMessage({ action: "getTime" }, function(response) {
//   get_break_time = response;
//   console.log(get_break_time);

//   if ((get_break_time != "00:00")) {
//     console.log("Hi/???")
//     breakStatus = 2;
//     const timerInterval = setInterval(updateTimer, 1000); // Update every second      
//   }
// });