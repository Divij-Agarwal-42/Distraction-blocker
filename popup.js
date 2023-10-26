const button = document.getElementById("goToLandingPage");
let buttonClickedPromise = new Promise((resolve) => {
    button.addEventListener("click", () => {
      resolve(true);
    });
});