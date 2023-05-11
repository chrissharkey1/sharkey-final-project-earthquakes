async function mainEvent() {
    const homePageButton = document.querySelector('#home');
  
    homePageButton.addEventListener("click", (event) => {
      console.log('home page clicked');
      window.location.href="./home.html";
    });
  }
  
  document.addEventListener('DOMContentLoaded', async () => mainEvent());
