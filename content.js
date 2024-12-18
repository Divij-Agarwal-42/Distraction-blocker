// The code here runs whenever any YouTube's subdomain is loaded

let hide_recommendations = true;
let hide_comments = true;

function make_settings_sign_post() {
  let sign_post = document.createElement('span');
  sign_post.id = "hidden_sign_post";
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
    // Send a message to background script for redirecting to settings page
    chrome.runtime.sendMessage({ redirect: "landing_page.html" }, function(response) {
    });
  });
}

// function to hide recommendations and comments
var hide_elements = function (){

  // Checking if the user is on YouTube's home page
  if ((window.location.href.indexOf("watch?v=") < 0) &&
      ((window.location.href.endsWith("youtube.com/")) || (window.location.href == "https://www.youtube.com") ||
      window.location.href.startsWith("https://www.youtube.com/?bp"))) {

    let side_menu = document.querySelector("#guide-content");
    let recommendations = document.querySelector("#primary[class*='browse']");
    let settings_sign_post = document.body.querySelector("#hidden_sign_post");

    if (document.querySelector("title").innerText == "YouTube" && side_menu != null && recommendations != null) {
        clearInterval(interval_id);

        if(hide_recommendations) {
          recommendations.style.display = "none";
          side_menu.style.display = "none";

          if (settings_sign_post == null) {
            make_settings_sign_post();
          }
        }
      }

  } else { // This means that the user is watching a video / short

    // User watching a short
    if (window.location.href.includes("youtube.com/shorts")) {
      let all_comment_buttons = document.querySelectorAll('#comments-button')

      if (!hide_comments) {
        clearInterval(interval_id);
      }
      else if (all_comment_buttons && hide_comments) {
        clearInterval(interval_id);
        all_comment_buttons.forEach(element => element.remove());
      }

    } else if (window.location.href.includes("youtube.com/watch"))  { // User watching a video
      //related_element refers to the recommended videos shown on the side
      let related_element = document.querySelector('#related').querySelector("#items");
      let comments_element = document.querySelector("#comments")

      if (related_element != null && comments_element != null) {
          clearInterval(interval_id);

          if(related_element && hide_recommendations){
              related_element.parentElement.parentElement.style.display= "none";
          }

          if(comments_element && hide_comments){
              comments_element.style.display = "none";
          }
      }
    }

  }
}

let wait_time = 1;
let interval_id = null;
// Load settings for whether recommendations and comments need to be hidden
async function load_settings() {
  try {
    let hidden_recs = await chrome.storage.local.get(["hide_recs"]);
    let hidden_comms = await chrome.storage.local.get(["hide_coms"]);
    hide_recommendations = hidden_recs.hide_recs;
    hide_comments = hidden_comms.hide_coms;

    // repeatedly tries to find elements to hide them
    interval_id = setInterval(function () {hide_elements()}, wait_time);
    wait_time = wait_time * 5;
  } catch {}
};
load_settings();

// Listen for whenever page reloads, then load settings (load settings calls hide_elements())
chrome.runtime.onMessage.addListener((obj, sender, response) => {
  reload_counter = 0;
  let settings_sign_post = document.body.querySelector("#hidden_sign_post");

  if (settings_sign_post != null) {
    settings_sign_post.remove();
  }

  if (obj === "reloaded") {
      load_settings();
  }
})
