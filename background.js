// These functions are being used by timerscript.js and landing_page.js
export { go_back, set_timer, get_timer, hide_stuff, get_hiding_values, close_site };

// Storing value of timer value
let set_timer = async (time) => {
    await chrome.storage.local.set({ time_value: time }).then(() => {
        console.log("Value is set");
    });
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
let go_back = function () {
  console.log("go back runs");
  chrome.tabs.update({ url: initial_url });
}

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
      initial_url = tab.url;
      console.log(initial_url);
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