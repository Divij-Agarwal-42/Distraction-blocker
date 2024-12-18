/*

background.js

This file contains the main code that's running in the background in the extension (can't access front end elements directly)
This file handles the logic for timeouts, breaks etc
The beginning of the file contains some set and get methods.
All the set methods are for storing different values local chrome storage. All get methods are for retriveing these values

*/

// These functions are being used by timerscript.js and landing_page.js
export { going_back, set_timer, get_timer, hide_stuff, get_hiding_values, close_site,
  set_timeout_settings, get_timeout_settings, set_break_settings, get_break_settings, start_break, set_break_hide_stuff,
  set_break_timeout, set_break_timeout_time };

let set_user_number = async (num) => {
  await chrome.storage.local.set({ user_number: num })
}

// Storing value of timer value
let set_timer = async (time) => {
  if (time == "0") {
    time = "1";
  }

  await chrome.storage.local.set({ time_value: time })
}

// Setting value for url
let set_initial_url = async (the_url) => {
  await chrome.storage.local.set({ initial_url: the_url })
}

// Storing values for having timeout on shorts / videos
let set_timeout_settings = async (enable_timeout, videos_status, shorts_status) => {
  await chrome.storage.local.set({ e: enable_timeout, v: videos_status, s: shorts_status })
}

// Set values for break settings (time and whether to quit youtube afterwards)
let set_break_settings = async function(time_value, quit_automatically, currently_ongoing) {
  await chrome.storage.local.set({ break_time: time_value, auto_quit: quit_automatically, ongoing: currently_ongoing })
}

// Storing value of hiding recommendations and hiding comments (true / false)
let hide_stuff = async (t1, t2) => {
  await chrome.storage.local.set({ hide_recs: t1, hide_coms: t2 })
}

let set_break_hide_stuff = async (t1, t2) => {
  await chrome.storage.local.set({ break_hide_recs: t1, break_hide_coms: t2 })
}

let set_break_timeout = async (enable_timeout, videos_status, shorts_status) => {
  await chrome.storage.local.set({ break_e: enable_timeout, break_v: videos_status, break_s: shorts_status })
}

let set_break_timeout_time = async (time) => {
  if (time == "0") {
    time = "1";
  }

  await chrome.storage.local.set({ break_timeout_time: time })
}

async function get_user_number() {
  try {
    let result = await chrome.storage.local.get(["user_number"]);
    return result.user_number;
  } catch {
    return -1;
  }
}

// Getting true / false values for having timeout on shorts / videos
async function get_timeout_settings() {
  try {
    let videos_status = await chrome.storage.local.get(["v"]);
    let shorts_status = await chrome.storage.local.get(["s"]);
    let enable_timeout = await chrome.storage.local.get(["e"]);

    return {enable: enable_timeout.e, videos: videos_status.v, shorts: shorts_status.s};

  } catch {
    return "Error";
  }
}

// Getting value for url
async function get_initial_url() {
  try {
    let url_object = await chrome.storage.local.get(["initial_url"]);
    return url_object.initial_url;
  } catch {
    return "Error";
  }
}

// Fetching values from chrome storage
async function get_hiding_values() {
    try {
      let hidden_recs = await chrome.storage.local.get(["hide_recs"]);
      let hidden_comms = await chrome.storage.local.get(["hide_coms"]);
      return {t1: hidden_recs.hide_recs, t2: hidden_comms.hide_coms};
    } catch {
      return "Error";
    }
}

// Getting timer value
let get_timer = async function() {
  try {
    let timer_promise = await chrome.storage.local.get(["time_value"])
    let value = timer_promise.time_value;

    if (value == null) {
      value = 10;
    }

    return value;
  } catch {
    
  };
}

// Set values for break settings (time and whether to quit youtube afterwards)
let get_break_settings = async function() {
  let break_settings = await chrome.storage.local.get();
  return break_settings;
};

// Useful to close all youtube tabs when the break ends
function close_all_tabs(close_this_link) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url && tab.url.includes(close_this_link)) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

let timerInterval;

// When browser is opened (background first loads, any previous break will be ended)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ ongoing: false })
});

let prevUrl;
//Listening for changes in url
chrome.tabs.onUpdated.addListener((tabId, tab) => {

  // Basically tells content script to work whenever there's a page change
  // This is needed for page reloads etc
  if (tab.url && tab.url.includes("youtube.com")) {
    chrome.tabs.sendMessage(tabId, "reloaded", function(response) {
      if (chrome.runtime.lastError) {
        // Ignore as this usually occurs just the first time
      }
    });
  }

  get_timeout_settings().then((status_type) => {
    // Checking to see if the timer page needs to be shown
    if (tab.url && ((status_type.videos && tab.url.includes("youtube.com/watch")) ||
      (status_type.shorts && tab.url.includes("youtube.com/shorts")))) {

      if (tab.url != prevUrl) {
        set_initial_url(tab.url);
        prevUrl = tab.url;

        chrome.tabs.update(tabId, { url: chrome.runtime.getURL("timer.html") });

        get_timer().then((value) => {
          setTimeout(() => {
          }, (value) * 1000);
        })

      }
    }

  })


})

// Close the site, open new tab, when exit is clicked on timer
function close_site() {
  chrome.tabs.create({ url: 'chrome://newtab' });
}

async function going_back() {
  try {
    let url_received = await get_initial_url();
    chrome.tabs.update({ url : url_received });
  } catch {
    console.log("Error");
  }
}

let server_ip = "35.197.15.174";

// Fetching anonymous user number from a server for analytics
async function fetch_user_number() {
  let user_num = -1;
  try {
    const response = await fetch(`https://${server_ip}:3000/user_number`);
    const data = await response.text();
    user_num = parseInt(data, 10);
  } catch(err) {
    console.log(err);
    return -1;
  }
  return user_num;
}

// First sees if there's a locally saved user number, if not, fetches it from server
// Returns -1 if it can't reach server
async function check_and_get_user_number() {
  let user_num = await get_user_number();
  if (user_num == -1 || user_num == null) {
    user_num = await fetch_user_number();
    if (user_num == -1) {
      return -1;
    }
    set_user_number(user_num);
  }
  return user_num;
}

chrome.runtime.onInstalled.addListener(function(details){

  if(details.reason == "install"){
    // Setting default values
    set_timeout_settings(true, false, true);
    hide_stuff(true, true);
    set_timer("10");
    set_break_settings(10, true, false);

    set_break_hide_stuff(false, false);
    set_break_timeout(false, false);
    set_break_timeout_time("10");

    fetch_user_number().then((user_num) => {
      set_user_number(user_num);
    });
  }

});

let recommendationsToggle = false;
let commentsToggle = false;
let enableTimoutToggle = false;
let videosToggle = false;
let shortsToggle = false;
let remainingTime = 0;

let updateTimer = function() {
  remainingTime--;
  if (remainingTime <= 0) {
    end_break();
    try {
    clearInterval(timerInterval);
    } catch {
      // Nothing needs to be done
    }
  }
}

let start_break = async function(break_time_value) {
  // Saving current settings so that they can be reverted to when break ends
  let hidding_values = await get_hiding_values();
  recommendationsToggle = hidding_values.t1;
  commentsToggle = hidding_values.t2;

  let timeout_settings = await get_timeout_settings();
  enableTimoutToggle = timeout_settings.enable;
  videosToggle = timeout_settings.videos;
  shortsToggle = timeout_settings.shorts;
  let break_settings = await get_break_settings();
  // Disabling all settings
  hide_stuff(break_settings.break_hide_recs, break_settings.break_hide_coms);
  set_timeout_settings(break_settings.break_e, break_settings.break_v, break_settings.break_s);
  remainingTime = break_time_value * 60;

  timerInterval = setInterval(updateTimer, 1000);
}

// Send data to server with anonymouse user id and click type
// click type: tracks whether user clicked on settings, toggle buttons etc
function send_data(current_user, click_type) {
  if (typeof current_user === 'string') {
    current_user = parseInt(current_user, 10);
  }

  // -1 means it's not a valid user, so function doesn't execute anything
  if (current_user <= -1) {
    return;
  }
  fetch(`https://${server_ip}:3000/analytics`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          user: current_user,
          click: click_type
      })
  }).catch(() => {
      return;
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "start") {
    start_break(request.value);

  } else if (request.redirect == "landing_page.html") {
    var landingPageUrl = chrome.runtime.getURL(request.redirect);
    chrome.tabs.create({ url: landingPageUrl });

    // This means that user clicked "settings" link on home page
    check_and_get_user_number().then((user_num) => {
      send_data(user_num, "settings_click");
    });
  }
});

let end_break = async function() {
  await hide_stuff(recommendationsToggle, commentsToggle);
  await set_timeout_settings(enableTimoutToggle, videosToggle, shortsToggle);
  let break_settings = await get_break_settings();

  if (break_settings.auto_quit == true) {
    // Goes through each tab, closes all tabs containing youtube.com
    close_all_tabs("youtube.com");
  }

  set_break_settings(break_settings.break_time, break_settings.break_time.auto_quit, false);
}