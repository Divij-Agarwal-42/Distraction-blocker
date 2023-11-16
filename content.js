let toggle1 = true;
let toggle2 = true;

let reload_counter = 1;

function reload_home() {

  if (reload_counter == 0) {
    location.reload(true);
    reload_counter++;
  }
}
// hide recommendations, comments
var justDoIt = function (){

  let noti_element = document.querySelector(".notification-button-style-type-default");
  (noti_element) ? noti_element.remove() : null;

  if ((window.location.href.indexOf("watch?v=") < 0) && (window.location.href.endsWith("youtube.com/"))) {
    //let recommended_element = document.querySelector("#dismissable")
    reload_home();
    let side_menu = document.querySelector("#guide-content");
    let primary = document.querySelector("#primary");

    if (primary != null) {
        clearInterval(interval_id);

        if(toggle1){
            primary.remove();
            console.log("This is working as expecte")
            //recommended_element.style.display = "none";
        }
        if(side_menu && toggle1){
            side_menu.style.display = "none";
        }
    }

  } else {
    let related_element = document.querySelector("#related")
    let comments_element = document.querySelector("#comments")

    if (related_element != null && comments_element != null) {
        clearInterval(interval_id);

        if(related_element && toggle2){
            related_element.parentElement.parentElement.style.display= "none";
        }
    
        if(comments_element && toggle2){
            comments_element.style.display = "none";
        }
    }

  }
}

let interval_id = null;
// Load values for hide recommendations, hide comments
async function load_values() {
  try {
    let hidden_recs = await chrome.storage.local.get(["hide_recs"]);
    let hidden_comms = await chrome.storage.local.get(["hide_coms"]);
    toggle1 = hidden_recs.hide_recs;
    toggle2 = hidden_comms.hide_coms;
    console.log(toggle1, toggle2);
    interval_id = setInterval(function () {justDoIt()}, 100);
  } catch {

  }
};
load_values();

// Listen for whenever page reloads, then load values (load values calls justDoit())
chrome.runtime.onMessage.addListener((obj, sender, response) => {
  reload_counter = 0; 
    if (obj === "reloaded") {
        console.log("PAGE RELOADED, content.js thiss side")
        load_values();
    }
})
