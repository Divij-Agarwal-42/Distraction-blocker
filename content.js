// The code here runs whenever any YouTube's subdomain is loaded

// toggle1 is whether the recommendations need to be hidden or not, true means they need to be hidden
// toggle2 is the same as toggle1 but for comments

let toggle1 = true;
let toggle2 = true;

let reload_counter = 1;

function reload_home() {

  if (reload_counter == 0) {
    location.reload(true);
    reload_counter++;
  }
}

// function to hide recommendations and comments
var justDoIt = function (){

  let noti_element = document.querySelector(".notification-button-style-type-default");

  if (noti_element) {
    noti_element.remove()
  }

  // Checking if the user is on YouTube's home page
  if ((window.location.href.indexOf("watch?v=") < 0) &&
      ((window.location.href.endsWith("youtube.com/")) || (window.location.href == "https://www.youtube.com") ||
      window.location.href.startsWith("https://www.youtube.com/?bp"))) {

    // 	body > ytd-app #content > ytd-page-manager, remove this element in subscription feed
    if (!toggle1) {
      reload_home();
    }

    // side_menu is the side bar element on YouTube's website (showing the user's subscriptions etc)
    // primary is the element that contains all the recommended videos on the home page

    let side_menu = document.querySelector("#guide-content");
    let primary = document.querySelector("#primary");

    if (primary != null) {
        clearInterval(interval_id);

        if(toggle1){
          primary.style.display = "none";
        }
        if(side_menu && toggle1){
            side_menu.style.display = "none";
        }
    }

  } else { // This means that the user is watching a video / short

    // User watching a short
    if (window.location.href.includes("youtube.com/shorts")) {
      let all_comment_buttons = document.querySelectorAll('#comments-button')

      if (!toggle2) {
        clearInterval(interval_id);
      }
      else if (all_comment_buttons && toggle2) {
        clearInterval(interval_id);
        all_comment_buttons.forEach(element => element.remove());
      }

    } else { // User watching a video
      //related_element refers to the recommended videos shown on the side
      let related_element = document.querySelector('#related').querySelector("#items");
      let comments_element = document.querySelector("#comments")

      if (related_element != null && comments_element != null) {
          clearInterval(interval_id);

          if(related_element && toggle1){
              related_element.parentElement.parentElement.style.display= "none";
          }

          if(comments_element && toggle2){
              comments_element.style.display = "none";
          }
      }
    }

  }
}

let interval_id = null;
// Load settings for whether recommendations and comments need to be hidden
async function load_values() {
  try {
    let hidden_recs = await chrome.storage.local.get(["hide_recs"]);
    let hidden_comms = await chrome.storage.local.get(["hide_coms"]);
    toggle1 = hidden_recs.hide_recs;
    toggle2 = hidden_comms.hide_coms;

    // repeatedly tries to find elements every 100 ms to hide them
    interval_id = setInterval(function () {justDoIt()}, 30);
  } catch {}
};
load_values();

// Listen for whenever page reloads, then load values (load values calls justDoit())
chrome.runtime.onMessage.addListener((obj, sender, response) => {
  reload_counter = 0;
    if (obj === "reloaded") {
        load_values();
    }
})
