/*
 * くらしの雑貨 てらす（自主制作サンプル）
 *
 * お知らせと商品を、ページ本体から切り離したデータファイルで管理する構成です。
 * ここでは data/*.json を読み込んでいます。実案件では、この読み込み先を
 * microCMS 等のヘッドレスCMS へ接続すると、お店の方がブラウザの管理画面から
 * 更新できるようになります（API接続とデータ変換の実装は別途必要です）。
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return esc(iso);
    return m[1] + '年' + Number(m[2]) + '月' + Number(m[3]) + '日';
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function renderNews(root, data, limit) {
    var items = (data && data.items) || [];
    if (limit) items = items.slice(0, limit);
    if (items.length === 0) {
      root.innerHTML = '<li class="news-item"><p class="empty">お知らせはまだありません。</p></li>';
      return;
    }
    root.innerHTML = items
      .map(function (n) {
        return (
          '<li class="news-item">' +
          '<div class="news-meta">' +
          '<time datetime="' + esc(n.date) + '">' + formatDate(n.date) + '</time>' +
          '<span class="news-tag" data-tag="' + esc(n.tag) + '">' + esc(n.tag) + '</span>' +
          '</div>' +
          '<h3>' + esc(n.title) + '</h3>' +
          '<p>' + esc(n.body) + '</p>' +
          '</li>'
        );
      })
      .join('');
  }

  function renderItems(root, data) {
    var items = (data && data.items) || [];
    if (items.length === 0) {
      root.innerHTML = '<p class="empty">商品を準備中です。</p>';
      return;
    }
    root.innerHTML = items
      .map(function (i) {
        var thumb = i.img
          ? '<img class="item-img" src="' + esc(i.img) + '" width="160" height="120" loading="lazy" decoding="async" alt="' + esc(i.alt || i.name) + '">'
          : '<span class="item-noimg" aria-hidden="true"></span>';
        return (
          '<article class="item-card">' +
          '<div class="item-thumb">' + thumb + '</div>' +
          '<div class="item-body">' +
          '<h3>' + esc(i.name) + '</h3>' +
          '<p class="price">' + esc(i.price) + '</p>' +
          '<p>' + esc(i.note) + '</p>' +
          '<p class="stock" data-stock="' + esc(i.stock) + '">' + esc(i.stock) + '</p>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function boot() {
    var newsRoot = document.querySelector('[data-news]');
    if (newsRoot) {
      var limit = Number(newsRoot.getAttribute('data-news')) || 0;
      fetchJson(newsRoot.getAttribute('data-src'))
        .then(function (d) { renderNews(newsRoot, d, limit); })
        .catch(function () {
          newsRoot.innerHTML =
            '<li class="news-item"><p class="empty">お知らせを読み込めませんでした。時間をおいて開き直してください。</p></li>';
        });
    }

    var itemRoot = document.querySelector('[data-items]');
    if (itemRoot) {
      fetchJson(itemRoot.getAttribute('data-src'))
        .then(function (d) { renderItems(itemRoot, d); })
        .catch(function () {
          itemRoot.innerHTML = '<p class="empty">商品情報を読み込めませんでした。</p>';
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
