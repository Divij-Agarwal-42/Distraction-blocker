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

          let sign_post = document.createElement('span');
          sign_post.textContent = "Recommendations are hidden";
          sign_post.style.position = "absolute";
          sign_post.style.padding = "10px";
          sign_post.style.fontSize = "1.2em";
          sign_post.style.borderRadius = "15px";
          sign_post.style.backgroundColor = "Silver";
          sign_post.style.color = "black";
          sign_post.style.left = "50%";
          sign_post.style.top = "20%";
          sign_post.style.transform = "translateX(-50%)";
          sign_post.style.textAlign = "center";

          let lineBreak = document.createElement('br');
          let link = document.createElement('span');
          link.textContent = "Settings";
          link.style.cursor = "pointer";
          link.style.color = "DimGray";
          link.style.textDecoration = "underline";

          sign_post.appendChild(lineBreak);
          sign_post.appendChild(link);
          document.body.appendChild(sign_post);

          link.addEventListener('mouseenter', function(event) {
            link.style.opacity = 0.8;
          });

          link.addEventListener('mouseleave', function(event) {
              link.style.opacity = 1;
          });

          link.addEventListener('click', function(event) {
            // Send a message to background script
            chrome.runtime.sendMessage({ redirect: "landing_page.html" }, function(response) {
                console.log("Message sent to background script");
            });
        });

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

    } else if (window.location.href.includes("youtube.com/watch"))  { // User watching a video
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
    interval_id = setInterval(function () {justDoIt()}, 10);
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
