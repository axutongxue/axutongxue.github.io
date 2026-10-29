/* 字号设置早应用：在菜单内容解析前读取用户保存的字号档位，以内联样式生效。
   内联 zoom 优先级高于 css/style.css 末尾的自动缩放媒体查询；
   显式的 1 也应用（= 强制 100%、关闭自动放大）。「恢复默认」会清除此设置。
   档位设置面板在 js/sidebar.js。 */
(function () {
  try {
    var v = parseFloat(localStorage.getItem("fontScale"));
    if (!isNaN(v) && v >= 0.8 && v <= 2) document.documentElement.style.zoom = v;
  } catch (e) { }
})();
/* ============================================================
 * 站内即时搜索（命令面板式）—— 迁移自 axutongxue.com.cn 线上版 resource-search.js
 * 适配说明（相对线上原版的改动）：
 * 1) 索引数据不再请求 api/nav.php，而是直接从本页 #mainmenu DOM 构建，
 *    因此无需后端、无需额外数据文件，目录更新后索引自动同步，file:// 打开亦可用；
 * 2) 面板样式（rs-*）由线上 style.css 迁移为脚本内注入，本文件即插即用；
 * 3) 线上原版无结果时回退到旧页内高亮查找；本文件整体替换旧版 find.js，
 *    无匹配时仅提示"未找到匹配资源"；
 * 4) 兼容首页既有按钮：onclick="show();" → 打开本面板（文件末尾桥接）；
 *    并保留旧版行为：搜索期间隐藏右侧 myRewards 栏，关闭后恢复。
 * 交互：顶部按钮 / Ctrl+K / Ctrl+F / 斜杠 唤起；↑↓ 选择、Enter 打开、Esc 关闭。
 * 支持三类资源：普通链接、弹窗型（displayContent）、confirm 确认型。
 * ============================================================ */

/* ---------- 面板样式（源自线上 style.css 的 rs-* 规则） ---------- */
(function () {
  var css = [
    '.rs-panel{position:fixed;inset:0;z-index:2147483000;display:none;background:rgba(0,0,0,.38);backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px);align-items:flex-start;justify-content:center;padding-top:11vh;}',
    '.rs-panel.is-open{display:flex;}',
    '.rs-box{width:min(620px,92vw);background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.28);overflow:hidden;border:1px solid #e6e6e6;}',
    '.rs-input{display:block;width:100%;box-sizing:border-box;padding:15px 18px;font-size:16px;border:0;border-bottom:1px solid #ececec;outline:none;background:#fff;color:#111;}',
    '.rs-input::placeholder{color:#9aa0a6;}',
    '.rs-list{max-height:52vh;overflow-y:auto;padding:6px 8px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;scrollbar-gutter:stable;scroll-behavior:smooth;}',
    '.rs-item{position:relative;padding:9px 12px;border-radius:8px;cursor:pointer;content-visibility:auto;contain-intrinsic-size:auto 48px;transition:background .12s ease-out;}',
    '.rs-item.is-active{background:#f2f3f5;}',
    '.rs-item:hover{background:#f1f2f4;}',
    '#rs-list.mouse .rs-item.is-active{background:transparent;}',
    '#rs-list.mouse .rs-item.is-active:hover{background:#f1f2f4;}',
    '.rs-t{font-size:15px;color:#111;line-height:1.4;display:flex;align-items:baseline;gap:8px;word-break:break-word;padding-right:150px;}',
    '.rs-t mark{background:#ffe08a;color:#111;border-radius:3px;padding:0 1px;}',
    '.rs-go{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;color:#b0b5ba;}',
    '.rs-cat{color:#777;font-size:12px;}',
    '.rs-meta{margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:baseline;padding-right:150px;}',
    '.rs-note{color:#9aa0a6;font-size:12px;max-width:100%;}',
    '.rs-empty{padding:16px;text-align:center;color:#9aa0a6;font-size:13px;}',
    '.rs-footer{padding:8px 14px;border-top:1px solid #f0f0f0;color:#9aa0a6;font-size:12px;}',
    /* 深色模式：配合 jquery.js 在切换深色时给 <html> 加/移除 dark-mode 类 */
    'html.dark-mode .rs-box{background:#1e1f22;border-color:#2f3335;}',
    'html.dark-mode .rs-input{background:#1e1f22;color:#ececec;border-color:#2f3335;}',
    'html.dark-mode .rs-input::placeholder{color:#6b7075;}',
    'html.dark-mode .rs-item.is-active{background:#2f3335;}',
    'html.dark-mode .rs-item:hover{background:#2b2e31;}',
    'html.dark-mode #rs-list.mouse .rs-item.is-active{background:transparent;}',
    'html.dark-mode #rs-list.mouse .rs-item.is-active:hover{background:#2b2e31;}',
    'html.dark-mode .rs-t{color:#ececec;}',
    'html.dark-mode .rs-t mark{background:#5d4a00;color:#ffd84d;}',
    'html.dark-mode .rs-cat{color:#8b9095;}',
    'html.dark-mode .rs-note{color:#6b7075;}',
    'html.dark-mode .rs-footer{border-color:#2f3335;color:#6b7075;}',
    /* 结果行操作按钮：选中行 / 悬停行显示"跳转目录 + 直接打开"，其余行显示 → 箭头 */
    '.rs-actions{position:absolute;right:12px;top:50%;transform:translateY(-50%);display:none;gap:6px;align-items:center;flex:none;}',
    '.rs-item.is-active .rs-actions,.rs-item:hover .rs-actions{display:flex;}',
    '.rs-item.is-active .rs-go,.rs-item:hover .rs-go{display:none;}',
    /* 鼠标模式下键盘选中行让位——但悬停的就是选中行本身时不让位 */
    '#rs-list.mouse .rs-item.is-active:not(:hover) .rs-actions{display:none;}',
    '#rs-list.mouse .rs-item.is-active:not(:hover) .rs-go{display:inline;}',
    /* 主操作"直接打开"= 站点品牌绿实底；次操作"跳转目录"= 中性灰幽灵按钮 */
    '.rs-btn{flex:none;padding:4px 11px;border-radius:6px;font-size:12px;font-weight:500;line-height:1.2;cursor:pointer;white-space:nowrap;border:1px solid transparent;transition:background .12s ease,border-color .12s ease;}',
    '.rs-btn-open{background:#07c160;border-color:#07c160;color:#fff;}',
    '.rs-btn-open:hover{background:#05a955;border-color:#05a955;}',
    '.rs-btn-jump{background:#f5f6f7;border-color:#e3e5e8;color:#595f63;}',
    '.rs-btn-jump:hover{background:#ececee;border-color:#d5d8db;color:#3d4348;}',
    'html.dark-mode .rs-btn-open{background:#07c160;border-color:#07c160;color:#fff;}',
    'html.dark-mode .rs-btn-open:hover{background:#05b257;border-color:#05b257;}',
    'html.dark-mode .rs-btn-jump{background:#2f3335;border-color:#3a3f42;color:#b8bdc2;}',
    'html.dark-mode .rs-btn-jump:hover{background:#3a3f42;color:#d6dade;}',
    /* 跳转目录后对目标条目闪烁定位 */
    '@keyframes rsLocateFlash{0%,45%{background-color:#ffe9a8;}100%{background-color:transparent;}}',
    '@keyframes rsLocateFlashDark{0%,45%{background-color:#4a4425;}100%{background-color:transparent;}}',
    'li.rs-locate-flash{animation:rsLocateFlash 2.6s ease-out;border-radius:6px;}',
    'html.dark-mode li.rs-locate-flash{animation-name:rsLocateFlashDark;}',
    '@media (max-width:480px){.rs-btn{padding:3px 8px;font-size:11px;}.rs-t,.rs-meta{padding-right:128px;}}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'rs-panel-css';
  st.textContent = css;
  document.head.appendChild(st);
})();

(function (global) {
  'use strict';

  var MAX = 24;
  var INDEX = null;
  var active = -1;
  var items = [];        // 当前渲染结果
  var panel = null, listEl = null, inputEl = null, footerEl = null, emptyEl = null;
  var dl = 0, qseq = 0;  // 输入防抖定时器 与 异步竞态令牌
  var lastQ = '', lastNames = ''; // 上次渲染的查询与结果名合集，用于跳过不变的 DOM 重建
  var ht = 0, hoverIdx = null;    // hover 节流时间戳 与 鼠标悬停项（供回车打开）

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function normalize(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ''); }
  function isSubseq(q, s) {
    var i = 0, j = 0, ql = q.length, sl = s.length;
    while (i < ql && j < sl) { if (q.charCodeAt(i) === s.charCodeAt(j)) { i++; } j++; }
    return i === ql;
  }
  // 高亮片段（精确子串）
  function hl(full, q) {
    var n = String(full == null ? '' : full);
    if (!q) return esc(n);
    var idx = n.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return esc(n);
    return esc(n.slice(0, idx)) + '<mark>' + esc(n.slice(idx, idx + q.length)) + '</mark>' + esc(n.slice(idx + q.length));
  }

  /* ---------- 从 #mainmenu DOM 构建导航树（适配点：替代线上 api/nav.php） ---------- */
  function textOf(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function buildItem(li) {
    // 主链接 = li 内第一个文本非空的 <a>（备用链接/图标锚无文本，自动跳过）
    var anchors = li.querySelectorAll('a'), main = null;
    for (var k = 0; k < anchors.length; k++) {
      if (textOf(anchors[k])) { main = anchors[k]; break; }
    }
    if (!main) return null;
    var href = main.getAttribute('href') || '';
    var onclick = main.getAttribute('onclick') || '';
    var item = { t: 'item', text: textOf(main) };
    if (href && href !== '#') item.href = href;
    var mp = onclick.match(/displayContent\('([\s\S]+?)'\)/);
    if (mp) item.popup = mp[1];
    var mc = onclick.match(/confirm\('([\s\S]+?)'\)/);
    if (mc) { item.confirm = mc[1]; if (href) item.href = href; }
    if (!item.href && !item.popup) return null;
    var title = main.getAttribute('title');
    if (title) item.title = title;
    var noteEl = li.querySelector('i[notes]');
    if (noteEl) item.notes = noteEl.getAttribute('notes') || '';
    item.el = li; // 保留 DOM 引用，供"跳转目录"定位
    return item;
  }

  function walkNav(ul, out) {
    for (var c = ul.firstElementChild; c; c = c.nextElementSibling) {
      if (c.tagName !== 'LI') continue;
      if (c.id === 'split') continue; // 分隔行不参与搜索
      var subUl = null, titleA = null, c2;
      for (c2 = c.firstElementChild; c2; c2 = c2.nextElementSibling) {
        if (c2.tagName === 'UL') subUl = c2;
        else if (c2.tagName === 'A' && !titleA && !c2.getAttribute('href') && !c2.getAttribute('onclick')) titleA = c2;
      }
      if (subUl && titleA) {
        var t = textOf(titleA);
        var children = [];
        walkNav(subUl, children);
        if (t) out.push({ t: 'folder', text: t, children: children });
        else out = out.concat(children);
        continue;
      }
      var it = buildItem(c);
      if (it) out.push(it);
    }
    return out;
  }

  function parseNavDom() {
    var root = document.getElementById('mainmenu');
    if (!root) return [];
    return walkNav(root, []);
  }

  // 扁平化导航树
  function flatten(nodes, cats) {
    var out = [];
    (nodes || []).forEach(function (n) {
      if (!n || typeof n !== 'object') return;
      var t = n.t || 'text';
      if (t === 'folder') {
        out = out.concat(flatten(n.children, cats.concat([n.text])));
      } else {
        var name = n.text || '';
        var cat = cats.slice(-2).join(' / ');           // 只取最近两级目录，少占位
        var notes = typeof n.notes === 'string' ? n.notes : '';
        var title = typeof n.title === 'string' ? n.title : '';
        out.push({
          name: name,
          cat: cat,
          href: typeof n.href === 'string' ? n.href : '',
          popup: typeof n.popup === 'string' ? n.popup : '',
          confirm: typeof n.confirm === 'string' ? n.confirm : '',
          notes: notes,
          title: title,
          el: n.el || null,
          // 预计算小写/去空白字段，避免每次击键重算导致卡顿
          name_n: normalize(name),
          cat_n: normalize(cat),
          notes_n: normalize(notes),
          title_n: normalize(title)
        });
      }
    });
    return out;
  }

  // 确保索引已构建（懒执行；打开面板时 DOM 已完整）
  function ensureIndex() {
    if (INDEX) return Promise.resolve(INDEX);
    if (global.__axuNavTree && global.__axuNavTree.length) {
      INDEX = flatten(global.__axuNavTree, []);
      return Promise.resolve(INDEX);
    }
    INDEX = flatten(parseNavDom(), []);
    return Promise.resolve(INDEX);
  }

  // 打分排序（使用预计算的小写字段，nq 为已归一化查询词）
  function score(it, nq) {
    var nn = it.name_n, cn = it.cat_n, no = it.notes_n, tn = it.title_n;
    var sc = 0;
    if (nn === nq) sc += 2000;                          // 完全一致
    else if (nn.indexOf(nq) === 0) sc += 1500;          // 前缀
    else if (nn.indexOf(nq) > 0) sc += 1200 + Math.max(0, 200 - nn.indexOf(nq)); // 子串越靠前越高
    else if (isSubseq(nq, nn)) sc += 700;              // 名称模糊
    if (isSubseq(nq, cn)) sc += 350;                   // 目录路径模糊
    if (cn.indexOf(nq) > -1 && nn.indexOf(nq) < 0) sc += 150;
    if (no.indexOf(nq) > -1) sc += 120;                // 备注子串
    if (tn.indexOf(nq) > -1) sc += 60;                 // 标题子串
    // 多字段任意一处精确命中或名称模糊命中才纳入，否则剔除（避免噪声）
    return (nn.indexOf(nq) > -1 || cn.indexOf(nq) > -1 || no.indexOf(nq) > -1 || tn.indexOf(nq) > -1 || isSubseq(nq, nn)) ? sc : -1;
  }

  function search(q) {
    var nq = normalize(q);
    if (!nq) return [];
    var res = [];
    for (var i = 0; i < INDEX.length; i++) {
      var s = score(INDEX[i], nq);
      if (s > 0) res.push({ it: INDEX[i], s: s });
    }
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, MAX).map(function (x) { return x.it; });
  }

  function openIt(it) {
    if (it.popup) {
      if (typeof global.displayContent === 'function') { global.displayContent(it.popup); }
    } else if (it.confirm) {
      if (global.confirm(it.confirm)) { location.href = it.href; }
    } else if (it.href) {
      location.href = it.href;
    }
  }

  // 单行 HTML
  function rowHTML(it, q) {
    var cat = it.cat ? '<span class="rs-cat">' + esc(it.cat) + '</span>' : '';
    var note = it.notes ? '<span class="rs-note">' + esc(it.notes.length > 40 ? it.notes.slice(0, 40) + '…' : it.notes) + '</span>' : '';
    var jump = it.el ? '<button type="button" class="rs-btn rs-btn-jump">跳转目录</button>' : '';
    var actions = '<span class="rs-actions">' + jump + '<button type="button" class="rs-btn rs-btn-open">直接打开</button></span>';
    var openable = it.href || it.popup ? '<span class="rs-go">→</span>' : '';
    return '<div class="rs-t">' + hl(it.name, (q || '').trim()) + actions + openable + '</div>' +
      '<div class="rs-meta">' + cat + note + '</div>';
  }

  // 跳转结果所在目录：关闭面板 → 展开祖先目录 → 滚动定位并闪烁高亮（参照旧版 find.js）
  function jumpToDirectory(it) {
    if (!it || !it.el) return;
    close();
    var li = it.el;
    if (!li.isConnected) { INDEX = null; return; } // 页面已变，索引待重建
    var p = li.parentElement;
    while (p && p !== document.body) {
      if (p.tagName === 'UL' && p.classList.contains('menu')) p.style.display = 'block';
      p = p.parentElement;
    }
    li.classList.remove('rs-locate-flash');
    void li.offsetWidth; // 强制重排，保证连续跳转时动画能重新播放
    li.classList.add('rs-locate-flash');
    setTimeout(function () { li.classList.remove('rs-locate-flash'); }, 2800);
    li.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 增量更新：复用已有行节点，仅对内容变化的行重建 innerHTML；
  // 未变的行节点原样保留（不销毁→不重排→滚动/布局连续），从根上消掉整表闪跳。
  function syncRows(list, q) {
    var n = list.length;
    var child = listEl.firstChild, i = 0;
    while (child && i < n) {
      var html = rowHTML(list[i], q);
      if (child.dataset.sig !== html) {     // 行内容变化时才写，未变则零开销
        child.dataset.sig = html;
        child.innerHTML = html;
      }
      child.setAttribute('data-i', String(i));
      child.classList.toggle('is-active', i === active);
      child = child.nextSibling;
      i++;
    }
    while (child) { var d = child.nextSibling; listEl.removeChild(child); child = d; } // 移除多余行
    while (i < n) {                          // 末尾缺失的行补上
      var div = document.createElement('div');
      div.className = 'rs-item';
      div.setAttribute('data-i', String(i));
      var h = rowHTML(list[i], q);
      div.dataset.sig = h;
      div.innerHTML = h;
      if (i === active) div.classList.add('is-active');
      listEl.appendChild(div);
      i++;
    }
  }

  function syncActive(i) {
    active = Math.max(0, Math.min(items.length - 1, i == null ? 0 : i));
    var nodes = listEl.children;
    for (var k = 0; k < nodes.length; k++) nodes[k].classList.toggle('is-active', k === active);
  }

  function render(list, q) {
    items = list;
    active = list.length ? 0 : -1;
    if (!list.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      footerEl.textContent = '未找到匹配资源 · Esc 关闭';
      return;
    }
    // 结果名合集若与上次完全一致则跳过重建，仅复位高亮（避免重排）
    var joined = list.map(function (x) { return x.name; }).join('\u0001');
    if (joined === lastNames && q === lastQ) {
      syncActive(0);
      footerEl.textContent = list.length + ' 条结果 · ↑↓ 选择 · Enter 打开 · Shift+Enter 跳目录 · Esc 关闭';
      return;
    }
    lastNames = joined;
    lastQ = q || '';
    hoverIdx = null;
    if (listEl) listEl.classList.remove('mouse'); // 新结果回到键盘高亮基线
    emptyEl.style.display = 'none';
    syncRows(list, q);
    footerEl.textContent = list.length + ' 条结果 · ↑↓ 选择 · Enter 打开 · Shift+Enter 跳目录 · Esc 关闭';
  }

  // 空输入提示（不记录搜索历史，仅显示使用说明）
  function showHint() {
    items = [];
    active = -1;
    lastQ = '';
    lastNames = '';
    hoverIdx = null;
    if (listEl) { listEl.classList.remove('mouse'); listEl.innerHTML = ''; }
    emptyEl.style.display = 'none';
    footerEl.textContent = '输入关键词即可即时搜索（支持模糊匹配名称、目录、备注） · Esc 关闭';
  }

  // 一级：最快匹配（仅名称子串，遇到满 MAX 即提前返回，不排序）——用于输入即刻反馈
  function quick(q) {
    var nq = normalize(q), cap = Math.min(MAX, 24), out = [];
    for (var i = 0; i < INDEX.length && out.length < cap; i++) {
      if (INDEX[i].name_n.indexOf(nq) > -1) out.push(INDEX[i]);
    }
    return out;
  }

  function onInput() {
    var q = inputEl.value.trim();
    clearTimeout(dl);
    if (!q) { ++qseq; showHint(); return; }
    var token = ++qseq;               // 作废旧输入
    var val = q;
    // 一级：即刻反馈（名称子串，亚毫秒）
    ensureIndex().then(function () {
      if (token !== qseq) return;
      render(quick(val), val);
    });
    // 二级：100ms 后全量模糊精修排序
    dl = setTimeout(function () {
      if (token !== qseq) return;     // 期间又有新输入，交给新的即时通道
      runSearch(val, token);
    }, 100);
  }

  function runSearch(q, token) {
    ensureIndex().then(function () {
      if (token !== qseq) return;     // 丢弃陈旧结果，防串台
      render(search(q), q);
    }).catch(function () {
      if (token !== qseq) return;
      footerEl.textContent = '索引构建失败，请刷新页面重试';
    });
  }

  function commit() {
    var q = inputEl.value.trim();
    var idx = hoverIdx != null ? hoverIdx : (active >= 0 ? active : 0);
    var it = items[idx];
    if (it && q) { openIt(it); }
    else if (q) { submitQuery(q); }
    close();
  }

  // 无匹配时的回退：本站无旧页内高亮查找，仅提示
  function submitQuery(q) {
    footerEl.textContent = '未找到"' + q + '"相关资源，试试更短的关键词';
  }

  function open() {
    ensureIndex().catch(function () {});
    clearTimeout(dl);
    if (!panel) build();
    panel.classList.add('is-open');
    document.body.classList.add('rs-open');
    // 保留旧版 find.js 行为：搜索期间隐藏右侧 myRewards 栏
    var mr = document.getElementById('myRewards');
    if (mr) mr.style.display = 'none';
    ++qseq; // 作废上次可能未完成的结果，避免串台
    hoverIdx = null;
    if (listEl) listEl.classList.remove('mouse');
    inputEl.value = '';
    showHint();
    setTimeout(function () { inputEl.focus(); }, 10);
  }
  function close() {
    clearTimeout(dl);
    ++qseq;
    if (panel) panel.classList.remove('is-open');
    document.body.classList.remove('rs-open');
    // 恢复右侧 myRewards 栏
    var mr = document.getElementById('myRewards');
    if (mr) mr.style.display = '';
  }
  function toggle() {
    if (panel && panel.classList.contains('is-open')) close();
    else open();
  }

  function build() {
    panel = document.createElement('div');
    panel.id = 'rs-panel';
    panel.className = 'rs-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.innerHTML =
      '<div class="rs-box">' +
      '<input id="rs-input" class="rs-input" type="search" autocomplete="off" spellcheck="false" ' +
      'enterkeyhint="open" placeholder="搜索全部资源（名称/目录/备注）…" aria-label="搜索全部资源">' +
      '<div class="rs-empty" id="rs-empty">没有搜到相关结果，请尝试更换搜索词，或者前往公众号留言咨询</div>' +
      '<div class="rs-list" id="rs-list"></div>' +
      '<div class="rs-footer" id="rs-footer"></div>' +
      '</div>';
    document.body.appendChild(panel);

    listEl = $('rs-list');
    inputEl = $('rs-input');
    footerEl = $('rs-footer');
    emptyEl = $('rs-empty');

    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!items.length) return;
        if (e.shiftKey) { jumpToDirectory(items[hoverIdx != null ? hoverIdx : (active >= 0 ? active : 0)]); return; }
        commit();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!items.length) return;
        // 切回键盘模式，高亮交由 .is-active
        hoverIdx = null; listEl.classList.remove('mouse');
        setActive(e.key === 'ArrowDown' ? active + 1 : active - 1, true);
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    // 鼠标高亮完全交给 CSS :hover，JS 只记录悬停项（供回车打开），不在每次移动改 DOM
    listEl.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - ht < 60) return;      // 节流：只更新变量，开销趋近于零
      ht = now;
      listEl.classList.add('mouse');  // 隐藏键盘高亮，避免与 :hover 一起显示
      var node = e.target.closest ? e.target.closest('.rs-item') : null;
      hoverIdx = node && node.getAttribute('data-i') != null ? +node.getAttribute('data-i') : null;
    });
    listEl.addEventListener('mouseleave', function () { hoverIdx = null; listEl.classList.remove('mouse'); });
    listEl.addEventListener('click', function (e) {
      var node = e.target.closest ? e.target.closest('.rs-item') : null;
      if (!node) return;
      var it = items[+node.getAttribute('data-i')];
      if (!it) return;
      var btn = e.target.closest('.rs-btn');
      if (btn) {
        if (btn.classList.contains('rs-btn-jump')) jumpToDirectory(it);
        else { openIt(it); close(); }
        return;
      }
      openIt(it); close();
    });

    panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
  }

  function setActive(i, scroll) {
    syncActive(i);
    if (scroll !== false && items[active]) {
      var el = listEl.children[active];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
  }

  // —— 全局快捷键 ——
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    var typing = (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable));
    if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) { close(); return; }
    // Ctrl+K
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); toggle(); return; }
    // 斜杠（非输入态）
    if (e.key === '/' && !typing && !(e.ctrlKey || e.metaKey || e.altKey)) { e.preventDefault(); open(); return; }
    // Ctrl+F 打开面板（替代页内高亮）
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); open(); return; }
  });

  global.ResourceSearch = { open: open, close: close, toggle: toggle, refresh: function () { INDEX = null; } };
})(typeof window !== 'undefined' ? window : globalThis);

// 兼容首页既有按钮：onclick="show();" 直接打开搜索面板
window.show = function () { window.ResourceSearch.open(); };

// 支持 ?q=关键词 直达搜索（配合 WebSite 结构化数据的 SearchAction 站内搜索框）
(function () {
  function openWithQuery() {
    var q = '';
    try { q = (new URLSearchParams(location.search).get('q') || '').trim(); } catch (e) {}
    if (!q) return;
    window.ResourceSearch.open();
    setTimeout(function () {
      var input = document.getElementById('rs-input');
      if (!input) return;
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 30);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openWithQuery);
  } else {
    openWithQuery();
  }
})();
