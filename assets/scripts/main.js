// https://stackoverflow.com/questions/42401606/how-to-hide-collapsible-bootstrap-navbar-on-click
const menuToggle = document.getElementById("navbarNavCollection");
if (menuToggle) {
  const navLinks = menuToggle.querySelectorAll("li.nav-item:not(.dropdown)");
  const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
  navLinks.forEach((l) => {
    l.addEventListener("click", () => {
      if (menuToggle.classList.contains("show")) {
        bsCollapse.toggle();
      }
    });
  });
}
