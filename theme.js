/* milkstudio light / dark mode — follows the phone's setting until the cookie is tapped */
(function () {
  var KEY = "ms-theme", root = document.documentElement;
  var mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
  function sys() { return mq && mq.matches ? "dark" : "light"; }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(t) {
    root.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "dark" ? "#1E1814" : "#E9E7DA";
    var b = document.getElementById("themeBtn");
    if (b) {
      var ar = root.lang === "ar";
      b.setAttribute("aria-label", t === "dark" ? (ar ? "الوضع الفاتح" : "Light mode") : (ar ? "الوضع الداكن" : "Dark mode"));
      var lbl = b.querySelector(".theme-lbl");
      if (lbl) lbl.textContent = t === "dark" ? (ar ? "الوضع الفاتح" : "Light mode") : (ar ? "الوضع الداكن" : "Dark mode");
      b.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    }
  }
  apply(saved() || sys());
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (!saved()) apply(sys()); });
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.getElementById("themeBtn");
    if (!b) return;
    apply(root.getAttribute("data-theme"));
    b.addEventListener("click", function () {
      var t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, t); } catch (e) {}
      apply(t);
    });
  });
  window.msTheme = { refresh: function () { apply(root.getAttribute("data-theme")); } };
})();
