(function () {
  var IG = "based.suli";
  var cart = {};

  var css = document.createElement("style");
  css.textContent =
    ".drawer{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;justify-content:flex-end;z-index:50}" +
    ".drawer[hidden]{display:none}" +
    ".panel{background:#131313;color:#f2eee3;width:min(440px,100%);height:100%;overflow:auto;padding:1.25rem;padding-top:calc(1.25rem + env(safe-area-inset-top,0px));padding-bottom:calc(1.25rem + env(safe-area-inset-bottom,0px))}" +
    ".ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.ph h2{margin:0;font-size:1.4rem}" +
    ".x{background:none;border:0;color:#f2eee3;font-size:2rem;line-height:1;cursor:pointer;padding:0 .4rem}" +
    ".line{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.7rem 0;border-bottom:1px solid #2a2a28}.line small{color:#9a968b}" +
    ".qty{display:flex;align-items:center;gap:.7rem}.qty button{width:2rem;height:2rem;border-radius:50%;border:1px solid #2a2a28;background:none;color:#f2eee3;font-size:1.1rem;cursor:pointer}" +
    ".tot{display:flex;justify-content:space-between;padding:1rem 0;font-size:1.15rem}" +
    ".panel label{display:block;margin-bottom:.8rem;color:#9a968b;font-size:.95rem}" +
    ".panel input,.panel textarea{display:block;width:100%;margin-top:.3rem;padding:.75rem;background:#0b0b0b;color:#f2eee3;border:1px solid #2a2a28;border-radius:4px;font:inherit}" +
    ".send{width:100%;padding:.95rem;border-radius:2px;border:1px solid #4a4026;background:linear-gradient(90deg,#cdb872,#a8893a);color:#14110a;font:600 1rem sans-serif;cursor:pointer}" +
    ".note{color:#9a968b;margin:.8rem 0 0}";
  document.head.appendChild(css);

  var d = document.createElement("div");
  d.className = "drawer";
  d.hidden = true;
  d.innerHTML =
    '<div class="panel"><div class="ph"><h2>Your order</h2><button class="x" id="co-close" aria-label="Close">\u00d7</button></div>' +
    '<div id="co-lines"></div>' +
    '<div class="tot"><span>Total</span><strong id="co-total">0 IQD</strong></div>' +
    '<label>Name<input id="co-nm" autocomplete="name"></label>' +
    '<label>Phone<input id="co-ph" type="tel" autocomplete="tel"></label>' +
    '<label>City and address<input id="co-ad" autocomplete="street-address"></label>' +
    '<button class="send" id="co-send">Send order on Instagram</button>' +
    '<p class="note" id="co-msg" role="status"></p>' +
    '<textarea id="co-text" rows="7" hidden readonly></textarea></div>';
  document.body.appendChild(d);

  var linesEl = d.querySelector("#co-lines");
  var totalEl = d.querySelector("#co-total");
  var msg = d.querySelector("#co-msg");
  var box = d.querySelector("#co-text");

  function fmt(x) { return x.toLocaleString("en-US") + " IQD"; }

  function totals() {
    var q = 0, t = 0, k;
    for (k in cart) { q += cart[k].q; t += cart[k].q * cart[k].p; }
    return { q: q, t: t };
  }

  function draw() {
    var h = "", k, row;
    for (k in cart) {
      row = document.createElement("div");
      row.className = "line";
      var left = document.createElement("span");
      left.textContent = k;
      var small = document.createElement("small");
      small.style.display = "block";
      small.textContent = cart[k].p ? fmt(cart[k].p) : "Price to confirm";
      left.appendChild(small);
      var qty = document.createElement("span");
      qty.className = "qty";
      var minus = document.createElement("button");
      minus.textContent = "\u2212";
      minus.setAttribute("data-k", k);
      minus.setAttribute("data-d", "-1");
      minus.setAttribute("aria-label", "Less");
      var num = document.createTextNode(String(cart[k].q));
      var plus = document.createElement("button");
      plus.textContent = "+";
      plus.setAttribute("data-k", k);
      plus.setAttribute("data-d", "1");
      plus.setAttribute("aria-label", "More");
      qty.appendChild(minus); qty.appendChild(num); qty.appendChild(plus);
      row.appendChild(left); row.appendChild(qty);
      if (!h) { linesEl.innerHTML = ""; h = "x"; }
      linesEl.appendChild(row);
    }
    if (!h) { linesEl.innerHTML = '<p class="note">Your cart is empty.</p>'; }
    var s = totals();
    totalEl.textContent = fmt(s.t);
    var cartBtn = document.getElementById("cart");
    if (cartBtn) { cartBtn.textContent = "Cart (" + s.q + ")"; }
  }

  // Runs before the page's old cart code, and takes over its buttons
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".add");
    if (b) {
      e.stopPropagation();
      e.preventDefault();
      var card = b.closest(".card");
      var nameEl = card && card.querySelector("h3");
      if (!nameEl) { return; }
      var name = nameEl.textContent.trim();
      var priceEl = card.querySelector(".price");
      var price = priceEl ? (parseInt(priceEl.textContent.replace(/\D/g, ""), 10) || 0) : 0;
      if (!cart[name]) { cart[name] = { q: 0, p: price }; }
      cart[name].q += 1;
      draw();
      return;
    }
    if (e.target.closest("#cart")) {
      e.stopPropagation();
      e.preventDefault();
      d.hidden = false;
      draw();
    }
  }, true);

  d.addEventListener("click", function (e) {
    if (e.target.id === "co-close" || e.target === d) { d.hidden = true; return; }
    var k = e.target.getAttribute("data-k");
    if (k && cart[k]) {
      cart[k].q += parseInt(e.target.getAttribute("data-d"), 10);
      if (cart[k].q <= 0) { delete cart[k]; }
      draw();
    }
  });

  d.querySelector("#co-send").addEventListener("click", function () {
    var nm = d.querySelector("#co-nm").value.trim();
    var ph = d.querySelector("#co-ph").value.trim();
    var ad = d.querySelector("#co-ad").value.trim();
    var s = totals();
    if (!s.q) { msg.textContent = "Add a product first."; return; }
    if (!nm || !ph || !ad) { msg.textContent = "Please fill in your name, phone, and address."; return; }
    var t = "New order from the website\n", k;
    for (k in cart) {
      t += cart[k].q + " x " + k + (cart[k].p ? " - " + fmt(cart[k].q * cart[k].p) : "") + "\n";
    }
    t += "Total: " + fmt(s.t) + "\nName: " + nm + "\nPhone: " + ph + "\nAddress: " + ad;
    box.value = t;
    box.hidden = false;
    var manual = function () { msg.textContent = "Copy the order below, then open Instagram and send it to us."; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        msg.textContent = "Order copied. Paste it in the Instagram message and send.";
        setTimeout(function () { window.location.href = "https://ig.me/m/" + IG; }, 900);
      }, manual);
    } else { manual(); }
  });
})();
