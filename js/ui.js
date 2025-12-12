window.UI = (function(){
  function setIntroAutoHide(){
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        const intro = document.getElementById("introOverlay");
        if(intro){ intro.style.display = "none"; }
      }, 1600);
    });
  }

  function setActiveNav(route){
    document.querySelectorAll(".nav-links a").forEach(a => {
      const r = (a.getAttribute("href") || "").replace("#","");
      a.classList.toggle("active", r === route);
    });
  }

  return { setIntroAutoHide, setActiveNav };
})();
