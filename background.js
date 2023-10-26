// These functions are being used by timerscript.js and landing_page.js
export { going_back, set_timer, get_timer, hide_stuff, get_hiding_values, close_site };

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
let running = false;

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

let blocked = false
let initial_url;

// Listening for changes in url
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("timer.html")) {
    running = true;
  } else {
    running = false;
  }

  if (tab.url && tab.url.includes("youtube.com")) {
    chrome.tabs.sendMessage(tabId, "reloaded");
  }
  
  if (tab.url && tab.url.includes("youtube.com/watch")) {
      set_initial_url(tab.url);
      if (blocked == false) {
        blocked = true;
        running = true;
        chrome.tabs.update({ url: chrome.runtime.getURL("timer.html") });
      } else if (blocked == true) {
        blocked = false;
      }
  }
})

// Close the site, open new tab, when exit is clicked on timer
function close_site() {
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