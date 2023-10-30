import { going_back, get_timer, close_site, set_last_video } from "./background.js";

const proceedButton = document.querySelector('#proceed');
const lastVidButton = document.querySelector("#last_vid");

function startCountdown(start_time) {
    function countdown() {
        if (start_time > 0) {
            start_time--;
            document.getElementsByClassName("countdown")[0].innerHTML = start_time;
            setTimeout(countdown, 1000);
        } else {
            proceedButton.style.visibility = "visible";
            return
        }
    }

    countdown();
}

(async () => {
    try {
      let fetched_time = await get_timer();
      startCountdown(fetched_time);
    } catch {

    }
})();

const exitButton = document.querySelector('.exit');

// Set the window location to an empty string to exit the site
exitButton.addEventListener('click', function() {
  close_site();
  window.close();
});

proceedButton.addEventListener('click', function() {
    going_back();
    //window.location.href = initial_url;
})

lastVidButton.addEventListener('click', function() {
    set_last_video();
    going_back();
})

