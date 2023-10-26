import { set_timer, hide_stuff, get_hiding_values } from "./background.js";

// loading values for hide recommendations, hide comments checkboxes
(async function load_values() {
  try {
    let values = await get_hiding_values();

    document.getElementById("recommendationsToggle").checked = values.t1;
    document.getElementById("commentsToggle").checked = values.t2;
  } catch {

  }

})();

// Storing time based on new value
async function update_time() {
  try {
    await set_timer(document.getElementById("timeInput").value);
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