import { set_timer, hide_stuff, get_hiding_values, get_timer, set_timeout_settings, get_timeout_settings } from "./background.js";

// Hiding timeout settings based on Enable timeout
let timeoutSettings = document.getElementById("timeoutSettings")
let currentTime = document.getElementById("currentTime")
let timeoutcheckbox = document.getElementById("timeoutcheckbox");
let videosToggle = document.getElementById("videosToggle")
let shortsToggle = document.getElementById("shortsToggle")

const currentTimeStartText = "Time set to: "

if (timeoutSettings && timeoutcheckbox) {
  timeoutcheckbox.addEventListener("change", (event) => {
    if (event.target.checked) {
      timeoutSettings.style.visibility = "visible";
    } else {
      timeoutSettings.style.visibility = "hidden";
    }
  })
}

(async function load_time() {
  try { 
    let time_value = await get_timer();
    currentTime.innerText = currentTimeStartText + time_value;
  } catch {

  }
})();

// loading values for hide recommendations, hide comments checkboxes
(async function load_values() {
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

})();

// Storing time based on new value
async function update_time() {
  try {
    let time_value = document.getElementById("timeInput").value
    await set_timer(time_value);
    currentTime.innerText = currentTimeStartText + time_value;
  } catch {}
}

// Updating toggles based on new value
async function toggle_recommendations() {
  let toggle1 = document.getElementById("recommendationsToggle").checked;
  let toggle2 = document.getElementById("commentsToggle").checked;
  
  try {
    await hide_stuff(toggle1, toggle2);
  } catch {}
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

function update_timeout_settings() {
  let video_toggle = false;
  let shorts_toggle = false;
  let enable_timeout = timeoutcheckbox.checked;

  if (enable_timeout) {
    video_toggle = videosToggle.checked;
    shorts_toggle = shortsToggle.checked;
  }

  set_timeout_settings(enable_timeout, video_toggle, shorts_toggle);
}

videosToggle.addEventListener("change", update_timeout_settings)
shortsToggle.addEventListener("change", update_timeout_settings)
timeoutcheckbox.addEventListener("change", update_timeout_settings)