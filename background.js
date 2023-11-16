// These functions are being used by timerscript.js and landing_page.js

export { going_back, set_timer, get_timer, hide_stuff, get_hiding_values, close_site, set_timeout_settings, get_timeout_settings };

// Storing value of timer value
let set_timer = async (time) => {
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
  });;
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
    return value;
  } catch {
    
  };
}

// Variable to prevent weird behaviour when user tries to leave when timer comes

// Waiting for timer to complete basically
// async function update_timer(initial_url) {

//   try {

//     let timer_promise = await chrome.storage.local.get(["time_value"])
//     let value = timer_promise.time_value;
//     // setTimeout(() => {
//     //   console.log("Jeff")
//     //   if (running == true) {
//     //     chrome.tabs.update({ url: initial_url });
//     //     running = false;
//     //   }
//     // }, value * 1000)

//   } catch(msg) {
//     console.log(msg);
//   };
// }

// Proceed button initiates this, goes back to video


let initial_url;
let last_video = false;

function set_last_video() {
  last_video = true;
}

// Listening for changes in url
chrome.tabs.onUpdated.addListener((tabId, tab) => {

  console.log("BLocked value is", blocked);

  if (last_video == true) {
    console.log("Should close ?");
    chrome.tabs.remove(tabId);
  }

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
          }, (value - 1) * 1000);
        })

      }
    }
  })
  
  if (blocked == 2) {
    blocked = 0;
  }


})

// Close the site, open new tab, when exit is clicked on timer
function close_site() {
  blocked = false;
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