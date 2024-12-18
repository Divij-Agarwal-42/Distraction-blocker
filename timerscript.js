/*

This file handles the "timeout" page that comes before videos / shorts
Implements the timer countdown
Implements functionality for proceed and exit buttons

*/

import { going_back, get_timer, close_site } from "./background.js";

const proceedButton = document.querySelector('#proceed');

function startCountdown(start_time) {
    function countdown() {
        if (start_time > 0) {
            start_time--;
            // Updating timer text (for eg to 10s, 9s etc)
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
      startCountdown(+fetched_time + 1);
      // Adding 1 to fetched time to prevent proceed button from appearing before background.js timer ending
    } catch {

    }
})();

// If user clicks exit -> the window is closed and a new tab is opened
const exitButton = document.querySelector('.exit');
exitButton.addEventListener('click', function() {
  close_site();
  window.close();
});


proceedButton.addEventListener('click', function() {
    going_back();
})