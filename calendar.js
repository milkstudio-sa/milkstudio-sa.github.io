/* milkstudio delivery calendar — replaces the phone's date picker.
   Days before `min` are grey and can't be tapped on every device.
   Tap a day to start the range, tap a later day to end it. Writes YYYY-MM-DD into the
   hidden #dFrom / #dTo inputs and fires "change" so the page updates as before. */
(function () {
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parse = function (s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };

  window.msCalendar = function (box, opt) {
    var from = opt.from, to = opt.to, min = opt.min, lang = opt.lang;
    var view = parse(min); view.setDate(1);
    var minMonth = new Date(view);

    function fire(el) { el.dispatchEvent(new Event("change", { bubbles: true })); }

    function render() {
      var ar = lang() === "ar", loc = ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB";
      var names = ar ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"];
      var title = view.toLocaleDateString(loc, { month: "long", year: "numeric" });
      var canPrev = view > minMonth;
      var f = from.value, t = to.value || f;
      var first = new Date(view), start = first.getDay();
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      var cells = "";
      for (var i = 0; i < start; i++) cells += '<span></span>';
      for (var d = 1; d <= days; d++) {
        var v = view.getFullYear() + "-" + pad(view.getMonth() + 1) + "-" + pad(d);
        var off = v < min;
        var cls = off ? "off" : (v === f || v === t) ? "end" : (f && v > f && v < t) ? "mid" : "";
        cells += '<button type="button" data-v="' + v + '" class="' + cls + '"' + (off ? ' disabled aria-disabled="true"' : "") +
                 ' aria-label="' + parse(v).toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" }) + '"' +
                 (v === f || v === t ? ' aria-pressed="true"' : "") + ">" + d + "</button>";
      }
      var hint = !f ? (ar ? "اضغط أول يوم يناسبك" : "Tap the first day that suits you")
               : (f === t && !to.dataset.picked) ? (ar ? "اضغط آخر يوم، أو اتركه يوم واحد" : "Tap the last day, or keep it one day")
               : "";
      box.innerHTML =
        '<div class="cal-h">' +
          '<button type="button" class="cal-nav" data-nav="-1" aria-label="' + (ar ? "الشهر السابق" : "Previous month") + '"' + (canPrev ? "" : " disabled") + '>‹</button>' +
          '<b>' + title + '</b>' +
          '<button type="button" class="cal-nav" data-nav="1" aria-label="' + (ar ? "الشهر الجاي" : "Next month") + '">›</button>' +
        '</div>' +
        '<div class="cal-w">' + names.map(function (n) { return "<span>" + n + "</span>"; }).join("") + '</div>' +
        '<div class="cal-d">' + cells + '</div>' +
        (hint ? '<p class="cal-hint">' + hint + '</p>' : "");
    }

    box.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav && !nav.disabled) { view.setMonth(view.getMonth() + Number(nav.dataset.nav)); render(); return; }
      var b = e.target.closest("button[data-v]");
      if (!b || b.disabled) return;
      var v = b.dataset.v, f = from.value;
      if (!f || to.dataset.picked || v < f) {          // start a new range
        from.value = v; to.value = v; delete to.dataset.picked; fire(from);
      } else {                                         // finish the range
        to.value = v; to.dataset.picked = "1"; fire(to);
      }
      render();
    });

    render();
    return { render: render };
  };
})();
