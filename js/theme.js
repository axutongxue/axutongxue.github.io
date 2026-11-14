/* 站点深色模式开关（文档页 / reply 页共用）
   - 与首页共用同一个 cookie（status=dark|light），默认浅色
   - 必须放在 <head> 里同步执行：先设置 data-theme，避免首屏闪白
   - 页面里的按钮用 onclick="changemode()" 调用 */
(function () {
  'use strict';

  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function writeCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
  }

  function apply(dark) {
    var root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  apply(readCookie('status') === 'dark');

  window.changemode = function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    apply(!dark);
    writeCookie('status', dark ? 'light' : 'dark');
  };
})();