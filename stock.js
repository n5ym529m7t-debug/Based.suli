(function () {
  var out = [];
  function apply() {
    var cards = document.querySelectorAll('#grid .card');
    for (var i = 0; i < cards.length; i++) {
      var h = cards[i].querySelector('h3');
      var btn = cards[i].querySelector('.add');
      if (!h || !btn) continue;
      if (out.indexOf(h.textContent.trim()) > -1 && !btn.disabled) {
        btn.disabled = true;
        btn.style.opacity = '.45';
        btn.style.cursor = 'not-allowed';
        btn.innerHTML = '<span>OUT OF STOCK</span>';
      }
    }
  }
  function start() {
    var grid = document.getElementById('grid');
    if (grid) new MutationObserver(apply).observe(grid, { childList: true });
    fetch('stock.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { out = d.out || []; apply(); })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
