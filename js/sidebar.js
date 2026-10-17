/* ============================================================
   储物间右侧边栏：公告支持 / 省钱助手 / 失效反馈
   —— 原版 tctip 插件的重写版（现代原生 JS，无依赖、无兼容层）
   所有内容与布局都在下方「配置区」调整
   ============================================================ */
(() => {
  'use strict';

  /* ==================== 配置区（唯一数据源） ==================== */
  const NOTICE_TEXT = window.tctipNoticeText || '';   // 公告正文（在 index.html 内定义）
  const SHENG_URL = './discount/';                    // 省钱页面地址
  const FEISHU_FORM = 'https://my.feishu.cn/share/base/form/shrcnQEQph33whiOEjpqKiXMdeh';
  const BTN_TOP = '18%';                              // 公告按钮 top；省钱/反馈在其下方 calc 排布
  const PANEL_MID = '37%';                            // 公告面板垂直中线
  const IS_TOUCH = !window.matchMedia('(hover: hover)').matches;  // 无悬停能力的设备（手机/平板）用点击交互

  // 面板列表：第 1 项 text=公告正文；其余项 icon=左侧小图标、qrimg=右侧大二维码、href=点击二维码打开的链接
  const items = [
    { name: '公告栏', className: 'myR-on', icon: 'https://wework.qpic.cn/wwpic3az/898351_AxcBcqZ9QFmznfb_1753452407/0', text: NOTICE_TEXT },
    { name: '省钱助手', icon: 'https://img30.360buyimg.com/imgzone/jfs/t20270916/492555/38/14608/2388/6a7c50d1F4953950c/093604d04cb0e47b.png', qrimg: 'https://wework.qpic.cn/wwpic3az/246366_mZFjG984Th6cnsF_1792203994/0', href: './discount/', desc: '外卖、堂食、鲜果、饮品、打车、机票、代驾、酒店、民宿、买药、电影、快递……你的每一笔消费都有机会省一点！' },
    { name: '原创脚本', icon: 'https://wework.qpic.cn/wwpic3az/755748_82BqHYxHRFeywQI_1781873640/0', qrimg: 'https://wework.qpic.cn/wwpic3az/69229_HK1N-aaKRqCghV7_1781873370/0', href: 'https://mp.weixin.qq.com/s/ds7UNPOJL9ejsRo71C3SGQ', desc: '阿虚原创自动化脚本，正在升级当中。即将上线，敬请期待！' },
    { name: '知识星球', icon: 'https://wework.qpic.cn/wwpic3az/324339_-uMsHKhLT1Wvsqd_1753452478/0', qrimg: 'https://wework.qpic.cn/wwpic3az/92458_7aI3hjBjT2mMZNf_1753452493/0', href: 'https://t.zsxq.com/19d2gGtRe', desc: '如果你想获取阿虚更及时、高质量的回复，欢迎加入我的付费星球，享受全年无限次提问：提问越多，收获越大！星球内还提供公众号所有付费文章＋简单脚本或工具代的开发服务！加入星球，阿虚陪你一起终身成长' },
    { name: '特价会员', icon: 'https://wework.qpic.cn/wwpic3az/286348_17C1vK29QbeuqST_1753452519/0', qrimg: 'https://wework.qpic.cn/wwpic3az/780198_yFvvhyYKTi2-fSK_1753452531/0', href: 'http://axu.xpsup.cn/', desc: '阿虚自营特价会员充值网站：影视／音乐／读书／网盘／社交娱乐等会员都有！正规渠道官方直充，偶尔还有超低活动特价人工代充，阿虚担保，100%放心购买，已有6000+粉丝下单！🤝' },
    { name: '发布页', icon: 'https://wework.qpic.cn/wwpic3az/594861_XtI7KjRUR3iTmoh_1781873678/0', qrimg: 'https://wework.qpic.cn/wwpic3az/401046_8him-1W5QmmXKY1_1781711685/0', href: 'https://axutongxue.cccpan.com/', desc: '储物间主要使用以下域名后缀：com／net／cn　当然，更建议点击上图，查看并收藏地址发布页！' }
  ];

  /* ==================== 样式 ==================== */
  // 选择器与旧版完全一致（jquery.js 的暗色模式 CSS 依赖这些类名，勿改类名）
  const css = `
#feedbackBtn{position:fixed;right:0;top:calc(${BTN_TOP} + 223px);z-index:9998;width:30px;min-width:30px;background:#323d45;color:#fff;border:0;padding:1em 0;font:13px/1.4 "microsoft yahei",arial,sans-serif;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;writing-mode:vertical-rl;letter-spacing:2px;white-space:nowrap;overflow:visible}
#shengBtn{position:fixed;right:0;top:calc(${BTN_TOP} + 122px);z-index:9998;width:30px;min-width:30px;background:#323d45;color:#fff;border:0;padding:1em 0;font:13px/1.4 "microsoft yahei",arial,sans-serif;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;display:flex;justify-content:center;align-items:center;writing-mode:vertical-rl;letter-spacing:2px;white-space:nowrap;overflow:visible;text-decoration:none}
.btn-myRewards{position:fixed!important;right:0!important;left:auto!important;top:${BTN_TOP}!important;pointer-events:auto}
.btn-myRewards .sider-text{font:13px/1.4 "microsoft yahei",arial,sans-serif;width:30px;display:flex;justify-content:center;align-items:center;background-color:#323d45;margin:0;padding:1em 0;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;color:#fff;writing-mode:vertical-rl;letter-spacing:2px;white-space:nowrap}
.myRewards{position:fixed;right:0;top:${PANEL_MID}!important;transform:translateY(-50%)!important;z-index:10000;padding-left:30px;width:0;overflow:hidden;box-sizing:content-box;transition:width .2s;pointer-events:none}
.myRewards .btn-myRewards,.myRewards-main{pointer-events:auto}
.myRewards ul,.myRewards li{margin:0;padding:0}
.myRewards img{border:0;display:block}
.myRewards a{color:#000;text-decoration:none;outline:0 none}
.myRewards-main{width:240px;height:436px;font:12px/1.5 "microsoft yahei",tahoma,arial,sans-serif;color:#000;background-color:#fff;border:1px solid #dbdbdb;border-right:0}
.myR-h{margin:0;background-color:#e7e7e7}
.myRewards-main .myR-h{padding:0 0 0 6px;font-size:14px;font-weight:normal;background-image:none;padding-left:1em;height:36px;line-height:36px}
.myRewardsbox{font-size:0;background-color:#eee;width:240px}
.myRewards-list{display:inline-block;vertical-align:middle;width:90px;font-size:12px}
.myRewards-list ul{list-style:none}
.myRewards-list ul.not-full{border-top:1px solid #dfdfdf}
.myRewards-list li{display:block;height:47px;text-indent:0;transition:background-color .2s linear}
.myRewards-list a{position:relative;display:block;padding-left:39px;height:46px;line-height:46px;font-size:11px;border-bottom:1px solid #ccc}
.myRewards-list a.fifth{border-bottom:0}
.myRewards-list a img{position:absolute;left:5px;top:9px;width:30px;height:30px}
.myRewards-list .myR-on{border-right:0}
.myRewards-list .myR-on a,.myRewards-list .myR-on a:hover{background-color:#fff}
.myRewards-detail{display:inline-block;vertical-align:middle;width:150px;height:400px;font-size:12px;background-color:#fff}
.myRewards-ubox{padding:14px 5px 0 10px}
.myRewards-notice{margin-top:-10px;width:130px;min-height:106px;box-sizing:content-box;height:388px;position:relative;overflow:hidden scroll}
.myRewards-code-tit{margin:0 0 20px;width:132px;line-height:30px;font-size:12px;text-align:center;background-color:#e7e7e7;border-radius:10px}
.myRewards-code{margin:0 0 30px 0;padding:0 5px 0 10px}
.myRewards-code img{width:134px;height:134px;margin-left:-11px}
.myRewards-account{font-size:12px;word-break:break-all;line-height:revert;margin-top:-15px}
.myRewards .sider-close{float:right;height:36px;line-height:36px;font-family:sans-serif;width:30px;text-align:center;color:#777;font-weight:bold;cursor:pointer}
#feedbackBtn:hover{background:#454e57}
#feedbackBtn.active{background:#d9534f}
#feedbackBtn.active:hover{background:#c9302c}
body.feedback-select-mode #mainmenu a[href],body.feedback-select-mode #mainmenu a[HREF]{outline:2px dashed #d9534f!important}
body.feedback-select-mode #mainmenu a[href]:hover,body.feedback-select-mode #mainmenu a[HREF]:hover{background:#ffe5e0!important}
body.feedback-select-mode::after{content:"点击带链接的资源进行反馈，「点击右下角」或按「Esc键」退出选择模式";position:fixed;left:0;right:0;bottom:0;background:#d9534f;color:#fff;text-align:center;font:13px/2 "microsoft yahei",arial,sans-serif;z-index:9999}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ==================== 工具 ==================== */
  function el(tag, props, parent) {
    const node = document.createElement(tag);
    for (const k in props) {
      if (k === 'style') node.style.cssText = props[k];
      else node[k] = props[k];
    }
    (parent || document.body).appendChild(node);
    return node;
  }

  /* ==================== 公告按钮 + 面板 ==================== */
  // 公告按钮（右侧竖排文字）
  const btn = el('a', { className: 'btn-myRewards', title: '公告 ● 支持' });
  const btnText = el('p', { className: 'sider-text' }, btn);
  btnText.textContent = '公告 ● 支持';

  // 公告面板（藏在右侧，展开时宽 0 → 240）
  const container = el('div', { id: 'myRewards', className: 'myRewards' });
  const main = el('div', { className: 'myRewards-main' }, container);
  const closeBtn = el('a', { className: 'sider-close', title: '收起' }, main);
  closeBtn.textContent = '>>';
  const heading = el('h1', { className: 'myR-h' }, main);
  heading.textContent = '公众号自动回复资源见上方👆';
  const box = el('div', { className: 'myRewardsbox' }, main);
  const listBox = el('div', { className: 'myRewards-list' }, box);
  const ul = el('ul', {}, listBox);
  const detailBox = el('div', { className: 'myRewards-detail' }, box);
  const ubox = el('div', { className: 'myRewards-ubox' }, detailBox);

  let currentLi = null;

  // 渲染右侧详情：有 text 的项显示公告滚动区，否则显示二维码 + 说明
  function renderDetail(item) {
    ubox.innerHTML = '';
    if (item.text !== undefined) {
      const notice = el('div', { className: 'myRewards-notice' }, ubox);
      const p = el('p', { className: 'myRewards-text' }, notice);
      p.innerHTML = item.text;
    } else {
      const tip = el('p', { className: 'myRewards-code-tit' }, ubox);
      tip.textContent = '点击或扫描二维码访问';
      const code = el('div', { className: 'myRewards-code' }, ubox);
      if (item.href) code.onclick = function () { window.open(item.href, '_blank'); };
      el('img', { src: item.qrimg }, code);
      const acc = el('p', { className: 'myRewards-account' }, ubox);
      acc.textContent = item.desc || item.name;
    }
  }

  function selectItem(li, item) {
    if (currentLi) currentLi.className = '';
    li.className = 'myR-on';
    currentLi = li;
    renderDetail(item);
  }

  // 构建列表项（无悬停设备用点击切换详情）
  items.forEach(function (item) {
    const li = el('li', { className: item.className || '' }, ul);
    const a = el('a', {}, li);
    a.textContent = item.name;
    el('img', { className: 'png', src: item.icon, alt: item.name }, a);
    const pick = function () { selectItem(li, item); };
    if (!IS_TOUCH) a.addEventListener('mouseenter', pick);
    a.addEventListener('click', pick);
  });

  // 初始选中第一项
  selectItem(ul.firstElementChild, items[0]);

  /* 展开 / 收起 */
  function openPanel() {
    container.style.width = '240px';
    btn.style.display = 'none';
  }
  function closePanel() {
    container.style.width = '0px';
    btn.style.display = 'block';
  }

  if (!IS_TOUCH) {
    btn.addEventListener('mouseenter', openPanel);
    main.addEventListener('mouseleave', closePanel);
  } else {
    btn.addEventListener('click', function () {
      if (container.style.width === '240px') closePanel(); else openPanel();
    });
  }
  closeBtn.addEventListener('click', closePanel);

  /* ==================== 省钱助手按钮 ==================== */
  const sheng = el('a', { id: 'shengBtn', href: SHENG_URL, target: '_blank', title: '每天帮你省一点' });
  sheng.textContent = '省钱助手';

  /* ==================== 失效反馈（选择模式） ==================== */
  const fbBtn = el('button', { id: 'feedbackBtn' });
  fbBtn.textContent = '失效反馈';
  let selectMode = false;

  function toggleSelectMode() {
    selectMode = !selectMode;
    document.body.classList.toggle('feedback-select-mode', selectMode);
    fbBtn.textContent = selectMode ? '退出选择模式' : '失效反馈';
    fbBtn.classList.toggle('active', selectMode);
  }

  // 拼出资源在菜单里的栏目路径（如 6-4-3 栏）
  function buildPath(a) {
    const nums = [];
    const li = a.closest('li');
    let node = li ? li.parentElement : null;
    while (node && node !== document.body) {
      if (node.tagName === 'LI') {
        const fa = node.querySelector(':scope > a');
        if (fa) {
          const m = (fa.textContent || '').match(/^\s*(\d+)/);
          if (m) nums.unshift(parseInt(m[1], 10));
        }
      }
      node = node.parentElement;
    }
    return nums.join('-') + '栏';
  }

  function isTarget(a) {
    if (!a || a.tagName !== 'A') return false;
    const h = a.getAttribute('href') || a.getAttribute('HREF');
    if (!h) return false;
    if (a.querySelector('img.bei')) return false;
    if (!(a.textContent || '').trim()) return false;
    const li = a.closest('li');
    if (li && li.querySelector(':scope > ul.menu')) return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    if (!selectMode) return;
    if (!e.target.closest('#mainmenu')) return;
    const a = e.target.closest('a');
    if (!a || !isTarget(a)) return;
    e.preventDefault();
    const name = (a.textContent || '').trim();
    const path = buildPath(a);
    const url = FEISHU_FORM + '?prefill_失效资源名称=' + name + '&prefill_所在目录路径=' + path;
    if (confirm('确认反馈以下失效资源？\n\n失效资源名称：' + name + '\n所在目录路径：' + path + '\n\n点击「确定」将跳转至飞书问卷。')) {
      toggleSelectMode();
      window.open(url, '_blank');
    }
  });

  fbBtn.addEventListener('click', toggleSelectMode);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && selectMode) toggleSelectMode();
  });
})();
