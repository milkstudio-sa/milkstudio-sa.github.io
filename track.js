/* milkstudio — saves form answers to your Google Sheet as people type.
   One row per visit, updated in place. The sheet address lives in links.js (sheetUrl).
   If sheetUrl is empty, nothing is sent. */
(function () {
  var URL = (window.SITE && window.SITE.sheetUrl) || "";
  var RANK = { started: 1, order: 2, review: 3, whatsapp: 4 };

  function sessionId(form) {
    var k = "ms-sid-" + form, v = null;
    try { v = sessionStorage.getItem(k); } catch (e) {}
    if (!v) {
      v = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
      try { sessionStorage.setItem(k, v); } catch (e) {}
    }
    return v;
  }

  window.msTrack = function (form, collect) {
    var best = "started", timer = null, last = "";

    function payload(status) {
      if (status && RANK[status] > RANK[best]) best = status;
      var d = collect();
      d.form = form; d.session = sessionId(form); d.status = best;
      var hp = document.getElementById("hp"); d.hp = hp ? hp.value : "";
      return d;
    }
    function worthSaving(d) {
      return !!(d.biz || d.cr || d.location || d.contact || (form === "wholesale" && d.items));
    }
    function send(status, leaving) {
      if (!URL) return;
      var d = payload(status);
      if (!worthSaving(d)) return;
      var body = JSON.stringify(d);
      if (body === last) return;
      last = body;
      try {
        if (leaving && navigator.sendBeacon) {
          navigator.sendBeacon(URL, new Blob([body], { type: "text/plain;charset=utf-8" }));
          return;
        }
        fetch(URL, { method: "POST", mode: "no-cors", keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).catch(function () {});
      } catch (e) {}
    }
    function soon() { clearTimeout(timer); timer = setTimeout(function () { send(); }, 2500); }

    document.addEventListener("input", soon, true);
    document.addEventListener("change", soon, true);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") { clearTimeout(timer); send(null, true); }
    });
    window.addEventListener("pagehide", function () { clearTimeout(timer); send(null, true); });

    return { step: function (status) { clearTimeout(timer); send(status); }, soon: soon };
  };
})();

/* Visits and button taps → "Clicks" tab.
   Where people came from: ?from=… on the link (ig, tag, …), else the referring site, else "direct".
   Remembered for the rest of the visit, so taps on the order page still count as "ig". */
(function () {
  var ENDPOINT = (window.SITE && window.SITE.sheetUrl) || "";
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  var from = store("ms-from");
  if (!from) {
    var q = (location.search.match(/[?&]from=([a-z0-9_-]{1,30})/i) || [])[1];
    var ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    if (ref === location.hostname) ref = "";
    from = q || (/instagram/.test(ref) ? "ig" : /tiktok/.test(ref) ? "tiktok" : /whatsapp|wa\.me/.test(ref) ? "whatsapp" : ref) || "direct";
    store("ms-from", from);
  }
  // Visitor code is remembered by this browser (not just this tab), so a returning phone keeps the same code.
  // Anonymous: a random string, nothing about the person.
  var visitor = null;
  try { visitor = localStorage.getItem("ms-visitor-id"); } catch (e) {}
  if (!visitor) {
    visitor = "v-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    try { localStorage.setItem("ms-visitor-id", visitor); } catch (e) {}
  }
  var page = /\/order\//.test(location.pathname) ? "Wholesale order" : /\/sample\//.test(location.pathname) ? "Free sample" : "Home";

  function send(event, button) {
    if (!ENDPOINT) return;
    var body = JSON.stringify({ type: "event", event: event, page: page, button: button || "", from: from, visitor: visitor });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=utf-8" }))) return;
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).catch(function () {});
    } catch (e) {}
  }
  window.msEvent = send;
  send("visit");
  // any element with data-ev="Button name" is counted when tapped
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-ev]");
    if (el) send("tap", el.getAttribute("data-ev"));
  }, true);
})();
