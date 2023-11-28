import { set_timer, hide_stuff, get_hiding_values, get_timer, set_timeout_settings, 
    get_timeout_settings, get_break_settings, set_break_timeout, set_break_timeout_time, set_break_hide_stuff } from "./background.js";

// Hiding timeout settings based on Enable timeout
let timeoutSettings = document.getElementById("timeoutSettings");
let currentTime = document.getElementById("currentTime");
let timeoutcheckbox = document.getElementById("timeoutcheckbox");
let videosToggle = document.getElementById("videosToggle");
let shortsToggle = document.getElementById("shortsToggle");
let breakSettings = document.getElementById("breakSettings");

const currentTimeStartText = "Time set to: "

// Hides settings if a break is underway
get_break_settings().then(breakSettings => {
  if (breakSettings.ongoing) {
    document.querySelector("h1").innerText = "Break underway, change settings later";
    // Hides all settings
    document.getElementById("mainGrid").style.visibility = "hidden";
    document.querySelector("#ytLogo").style.visibility = "hidden";
  }
});

if (timeoutSettings && timeoutcheckbox) {
  timeoutcheckbox.addEventListener("change", (event) => {
    if (event.target.checked) {
      timeoutSettings.style.visibility = "visible";
    } else {
      timeoutSettings.style.visibility = "hidden";
    }
  })
}

async function load_time() {
  try { 
    let time_value = await get_timer();
    currentTime.innerText = currentTimeStartText + time_value;
  } catch {

  }
}
load_time();

// loading values for hide recommendations, hide comments checkboxes
async function load_values() {
  try {
    let values = await get_hiding_values();

    document.getElementById("recommendationsToggle").checked = values.t1;
    document.getElementById("commentsToggle").checked = values.t2;

    let timeout_values = await get_timeout_settings();

    timeoutcheckbox.checked = timeout_values.enable;
    videosToggle.checked = timeout_values.videos;
    shortsToggle.checked = timeout_values.shorts;

    if (timeoutcheckbox.checked) {
      timeoutSettings.style.visibility = "visible";
    } else {
      timeoutSettings.style.visibility = "hidden";
    }
  } catch {

  }

}
load_values();

// Storing time based on new value
async function update_time() {
  try {
    let time_value = document.getElementById("timeInput").value
    if (time_value == "" || time_value == null) {
      time_value = "10"
    }

    if (break_settings_status == 0) {
      await set_timer(time_value);
    } else if (break_settings_status == 1) {
      await set_break_timeout_time(time_value);
    }
    currentTime.innerText = currentTimeStartText + time_value;
  } catch {}
}

// Updating toggles based on new value
async function toggle_recommendations() {
  let toggle1 = document.getElementById("recommendationsToggle").checked;
  let toggle2 = document.getElementById("commentsToggle").checked;
  
  if (break_settings_status == 0) {
    try {
      await hide_stuff(toggle1, toggle2);
    } catch {}
  } else if (break_settings_status == 1) {
    await set_break_hide_stuff(toggle1, toggle2);
  }
}

// Listening for updates on toggles / time
document.getElementById("submitTime").addEventListener("click", update_time);
document.getElementById("recommendationsToggle").addEventListener("change", toggle_recommendations);
document.getElementById("commentsToggle").addEventListener("change", toggle_recommendations);

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

async function update_timeout_settings() {
  let video_toggle = false;
  let shorts_toggle = false;
  let enable_timeout = timeoutcheckbox.checked;

  if (enable_timeout) {
    video_toggle = videosToggle.checked;
    shorts_toggle = shortsToggle.checked;
  }

  if (break_settings_status == 0) {
    set_timeout_settings(enable_timeout, video_toggle, shorts_toggle);
  } else if (break_settings_status == 1) {
    set_break_timeout(enable_timeout, video_toggle, shorts_toggle);
  }
}

videosToggle.addEventListener("change", update_timeout_settings)
shortsToggle.addEventListener("change", update_timeout_settings)
timeoutcheckbox.addEventListener("change", update_timeout_settings)

async function load_all_break_settings() {
  let break_settings = await get_break_settings();

  document.getElementById("recommendationsToggle").checked = break_settings.break_hide_recs;
  document.getElementById("commentsToggle").checked = break_settings.break_hide_coms;
  timeoutcheckbox.checked = break_settings.break_e;

  videosToggle.checked = break_settings.break_v;
  shortsToggle.checked = break_settings.break_s;
  let time_value = break_settings.break_timeout_time;
  currentTime.innerText = currentTimeStartText + time_value;

  if (timeoutcheckbox.checked == true) {
    timeoutSettings.style.visibility = "visible";
  } else {
    timeoutSettings.style.visibility = "hidden";
  }
}

let break_settings_status = 0 // 0 means program is showing main settings currently, 1 means it's showing break settings
breakSettings.addEventListener("click", function (event) {
  console.log("hi//??")
  if (break_settings_status == 0) { // Will now show break settings
    break_settings_status = 1;
    document.querySelector("h1").innerText = "Break settings";
    breakSettings.innerText = "Show main settings"
    load_all_break_settings();
    document.body.style.backgroundColor = "#272a36";

  } else if (break_settings_status == 1) { // Will now show main settings
    break_settings_status = 0;
    document.querySelector("h1").innerText = "Distraction Blocker Settings";
    breakSettings.innerText = "Show break settings"
    document.body.style.backgroundColor = "rgb(22, 22, 22)";
    load_values();
    load_time();
  }
})