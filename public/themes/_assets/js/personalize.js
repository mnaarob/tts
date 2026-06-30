/* Tech to Store — attribute-driven template personalizer
 * ------------------------------------------------------
 * The React preview at /#/themes feeds visitor data into this template
 * via the URL hash:
 *   #name=Acme&address=...&phone=...&email=...&hours=...
 *
 * Templates mark up personalizable spots semantically:
 *   <span data-pz="name">Demo Store</span>
 *   <a   data-pz="phone"   data-pz-link="tel">+1 555 0100</a>
 *   <a   data-pz="email"   data-pz-link="mailto">demo@example.com</a>
 *   <address data-pz="address">123 Demo St</address>
 *   <span data-pz="hours">Mon - Sat 9am to 9pm</span>
 *   <meta name="store-title-suffix" content=" - Grocery Shop">
 *
 * If a value isn't provided in the hash, the demo default already in the
 * markup is left untouched. The script is idempotent and re-runs on
 * `hashchange` and on `pageshow` (back/forward cache).
 *
 * The script also propagates `location.hash` to every same-template <a>
 * link ending in `.html` so the visitor's data follows them across pages.
 */
(function () {
  'use strict';

  var FIELDS = ['name', 'address', 'email', 'phone', 'hours'];

  function parseHash() {
    var raw = (window.location.hash || '').replace(/^#/, '');
    var data = {};
    if (!raw) return data;
    raw.split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var k = idx >= 0 ? pair.slice(0, idx) : pair;
      var v = idx >= 0 ? pair.slice(idx + 1) : '';
      try {
        v = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch (_) {
        /* keep raw */
      }
      if (FIELDS.indexOf(k) !== -1 && v) data[k] = v;
    });
    return data;
  }

  function applyText(el, value) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = value;
    } else {
      el.textContent = value;
    }
  }

  function applyLink(el, kind, value) {
    if (kind === 'tel') {
      el.setAttribute('href', 'tel:' + String(value).replace(/[^+\d]/g, ''));
    } else if (kind === 'mailto') {
      el.setAttribute('href', 'mailto:' + value);
    }
  }

  function applyAttr(el, attr, value) {
    el.setAttribute(attr, value);
  }

  function rewriteNodes(data) {
    var nodes = document.querySelectorAll('[data-pz]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var field = el.getAttribute('data-pz');
      var value = data[field];
      if (!value) continue;

      var attr = el.getAttribute('data-pz-attr');
      if (attr) {
        applyAttr(el, attr, value);
      } else {
        applyText(el, value);
      }
      var linkKind = el.getAttribute('data-pz-link');
      if (linkKind) applyLink(el, linkKind, value);
    }
  }

  function updateTitle(data) {
    if (!data.name) return;
    var meta = document.querySelector('meta[name="store-title-suffix"]');
    var suffix = meta ? meta.getAttribute('content') || '' : '';
    document.title = data.name + suffix;
  }

  function propagateHashToLinks() {
    var hash = window.location.hash || '';
    if (!hash) return;
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href') || '';
      if (!href) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue; /* tel:, mailto:, http(s): */
      if (href.indexOf('//') === 0) continue;
      if (href.charAt(0) === '#') continue;
      var bare = href.split('#')[0];
      if (!/\.html(\?|$)/i.test(bare)) continue;
      a.setAttribute('href', bare + hash);
    }
  }

  function apply() {
    var data = parseHash();
    rewriteNodes(data);
    updateTitle(data);
    propagateHashToLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  /* When the React parent updates the iframe `src` it remounts the document,
   * so apply() runs fresh. We also handle hashchange for in-iframe nav. */
  window.addEventListener('hashchange', apply);
  window.addEventListener('pageshow', apply);
})();
