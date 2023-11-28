// These functions are being used by timerscript.js and landing_page.js

export { going_back, set_timer, get_timer, hide_stuff, get_hiding_values, close_site, 
  set_timeout_settings, get_timeout_settings, set_break_settings, get_break_settings, start_break, set_break_hide_stuff, 
  set_break_timeout, set_break_timeout_time };

// Storing value of timer value
let set_timer = async (time) => {
    if (time == "0") {
      time = "1";
    }

    await chrome.storage.local.set({ time_value: time }).then(() => {
        console.log("Value is set");
    });
}
// Setting value for url
let set_initial_url = async (the_url) => {
  await chrome.storage.local.set({ initial_url: the_url }).then(() => {
      console.log("Value is set");
  });
}

// Storing values for having timeout on shorts / videos
let set_timeout_settings = async (enable_timeout, videos_status, shorts_status) => {
  await chrome.storage.local.set({ e: enable_timeout, v: videos_status, s: shorts_status }).then(() => {
      console.log("Value is set");
  });
}

// Set values for break settings (time and whether to quit youtube afterwards)
let set_break_settings = async function(time_value, quit_automatically, currently_ongoing) {
  await chrome.storage.local.set({ break_time: time_value, auto_quit: quit_automatically, ongoing: currently_ongoing }).then(() => {
    console.log("Value is set");
});
}

// Getting values for having timeout on shorts / videos
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
// Storing value of hiding recommendations and hiding comments (true / false)
let hide_stuff = async (t1, t2) => {
  await chrome.storage.local.set({ hide_recs: t1, hide_coms: t2 }).then(() => {
    console.log("hidding is set");
  });
}

let set_break_hide_stuff = async (t1, t2) => {
  await chrome.storage.local.set({ break_hide_recs: t1, break_hide_coms: t2 }).then(() => {
    console.log("hidding is set");
  });
}

let set_break_timeout = async (enable_timeout, videos_status, shorts_status) => {
  await chrome.storage.local.set({ break_e: enable_timeout, break_v: videos_status, break_s: shorts_status }).then(() => {
      console.log("Value is set");
  });
}

let set_break_timeout_time = async (time) => {
  if (time == "0") {
    time = "1";
  }

  await chrome.storage.local.set({ break_timeout_time: time }).then(() => {
      console.log("Value is set");
  });
}

// Fetching values from chrome storage
async function get_hiding_values(toggle1, toggle2) {
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

let blocked = 0;
let timerInterval;

// When browser is opened (background first loads, any previous break will be ended)
(async function clearBreak() {
  await chrome.storage.local.set({ ongoing: false }).then(() => {
    console.log("Value is set");
});
})();

//Listening for changes in url
chrome.tabs.onUpdated.addListener((tabId, tab) => {

  console.log("BLocked value is", blocked);

  if (tab.url && tab.url.includes("youtube.com")) {
    chrome.tabs.sendMessage(tabId, "reloaded");
  }
  
  get_timeout_settings().then((status_type) => {
    if (tab.url && ((status_type.videos && tab.url.includes("youtube.com/watch")) || 
      (status_type.shorts && tab.url.includes("youtube.com/shorts")))) {

      set_initial_url(tab.url);

      if ((blocked == 0) || (blocked == 1)) {
        blocked = 1;
        chrome.tabs.update({ url: chrome.runtime.getURL("timer.html") });

        get_timer().then((value) => {
          setTimeout(() => {
            blocked = 2;
          }, (value) * 1000);
        })

      }
    }

    if (blocked == 2) {
      blocked = 0;
    }
  })


})

// Close the site, open new tab, when exit is clicked on timer
function close_site() {
  blocked = 0;
  chrome.tabs.create({ url: 'chrome://newtab' });
}

async function going_back() {
  try {
    let url_received = await get_initial_url();
    console.log(url_received);
    chrome.tabs.update({ url : url_received });
  } catch {
    console.log("Error");
  }
}

chrome.runtime.onInstalled.addListener(function(details){

  if(details.reason == "install"){
    // Setting default values
    set_timeout_settings(true, true, true);
    hide_stuff(true, true);
    set_timer("10");
    set_break_settings(10, true, false);

    set_break_hide_stuff(false, false);
    set_break_timeout(false, false);
    set_break_timeout_time("10");
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
  console.log(remainingTime);
  if (remainingTime <= 0) {
    console.log("time is 0 moment detected, end break should be initiated");
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
  recommendationsToggle = await get_hiding_values().t1;
  commentsToggle = await get_hiding_values().t2;
  enableTimoutToggle = await get_timeout_settings().enable;
  videosToggle = await get_timeout_settings().videos;
  shortsToggle = await get_timeout_settings().shorts;

  // Disabling all settings
  hide_stuff(false, false);
  set_timeout_settings(false, false, false);

  remainingTime = break_time_value * 60;

  timerInterval = setInterval(updateTimer, 1000);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Check if the message is a request for info
  // if (request.action == "getTime") {
  //   console.log("Requested time")

  //   getCurrentBreakTime().then((value) => {
  //     let current_break_time = value;
  //     sendResponse(current_break_time);
  //   });

  // }
  if (request.action == "start") {
    start_break(request.value);
  }
});

let end_break = async function() {
  console.log("end break function is starting up")
  await hide_stuff(recommendationsToggle, commentsToggle);
  await set_timeout_settings(enableTimoutToggle, videosToggle, shortsToggle);
  let break_settings = await get_break_settings();

  if (break_settings.auto_quit == true) {
    // Goes through each tab, closes all tabs containing youtube.com
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab.url && tab.url.includes("youtube.com")) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  }

  set_break_settings(break_settings.break_time, break_settings.break_time.auto_quit, false);
}