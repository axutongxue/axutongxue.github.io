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
  const BTN_TOP = '18%';                              // 公告按钮 top
  const BTN_GAP = '12px';                             // 四个侧边栏按钮之间的统一间距
  const PANEL_MID = '37%';                            // 公告面板垂直中线
  const IS_TOUCH = !window.matchMedia('(hover: hover)').matches;  // 无悬停能力的设备（手机/平板）用点击交互
  const BACK_TOP_AFTER = 400;                         // 滚动超过该距离(px)后显示右下角「回到顶部」按钮

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
#sideStack{position:fixed;right:0;top:${BTN_TOP};z-index:9998;display:flex;flex-direction:column;align-items:flex-end;gap:${BTN_GAP}}
#sideStack>*{flex:0 0 auto}
#feedbackBtn{position:relative;right:auto;top:auto;z-index:9998;width:30px;min-width:30px;background:#323d45;color:#fff;border:0;padding:1em 0;font:13px/1.4 "microsoft yahei",arial,sans-serif;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;writing-mode:vertical-rl;letter-spacing:2px;white-space:nowrap;overflow:visible}
#shareBtn{position:relative;right:auto;top:auto;z-index:9998;width:30px;min-width:30px;height:45px;background:#323d45;color:#fff;border:0;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;overflow:visible}
#shareBtn:hover{background:#454e57}
#shareBtn svg{width:16px;height:16px;display:block;fill:currentColor;stroke:none}
#shengBtn{position:relative;right:auto;top:auto;z-index:9998;width:30px;min-width:30px;background:#323d45;color:#fff;border:0;padding:1em 0;font:13px/1.4 "microsoft yahei",arial,sans-serif;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;display:flex;justify-content:center;align-items:center;writing-mode:vertical-rl;letter-spacing:2px;white-space:nowrap;overflow:visible;text-decoration:none}
.btn-myRewards{position:relative!important;right:auto!important;left:auto!important;top:auto!important;pointer-events:auto}
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
#shengBtn:hover{background:#454e57}
#feedbackBtn.active{background:#d9534f}
#feedbackBtn.active:hover{background:#c9302c}
body.feedback-select-mode #mainmenu a[href],body.feedback-select-mode #mainmenu a[HREF]{outline:2px dashed #d9534f!important}
body.feedback-select-mode #mainmenu a[href]:hover,body.feedback-select-mode #mainmenu a[HREF]:hover{background:#ffe5e0!important}
body.feedback-select-mode::after{content:"点击带链接的资源进行反馈，「点击右下角」或按「Esc键」退出选择模式";position:fixed;left:0;right:0;bottom:0;background:#d9534f;color:#fff;text-align:center;font:13px/2 "microsoft yahei",arial,sans-serif;z-index:9999}

/* 回到顶部（外框配色与侧边栏三个按钮同款；内部为「上升三角 + TOP」图形） */
#backTopBtn{position:fixed;right:0;bottom:20px;z-index:9998;width:30px;min-width:30px;height:45px;border:0;padding:0;background:#323d45;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:12px;border-top-right-radius:0;border-bottom-right-radius:0;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s,background-color .2s}
#backTopBtn.show{opacity:1;visibility:visible}
#backTopBtn svg{width:20px;height:20px;display:block;fill:currentColor}
#backTopBtn:hover{background:#454e57}

/* 分享弹窗（结构与样式参考 yinghezhinan.com） */
#sharePopup{position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999999;display:none;align-items:center;justify-content:center;pointer-events:none}
#sharePopup.open{display:flex}
#sharePopup .share-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,10,10,.4);opacity:0;transition:opacity .3s;pointer-events:auto}
#sharePopup.open .share-overlay{opacity:1;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#sharePopup .share-body{position:relative;width:85%;max-width:390px;opacity:0;pointer-events:auto}
#sharePopup.open .share-body{animation:shareOpen .3s forwards}
@keyframes shareOpen{from{opacity:0;transform:translate3d(0,50px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
#sharePopup .share-content{position:relative;overflow:hidden;border-radius:14px;padding:120px 40px 0;background:radial-gradient(farthest-corner at 50% 20%,#f6f9f9 0%,#dae9ed 100%);box-shadow:0 10px 50px -5px rgba(6,39,67,.15)}
#sharePopup .yinghe-circle{width:100%;height:100%;position:absolute;top:0;left:0;pointer-events:none}
#sharePopup .yinghe-circle-inner{position:absolute;height:350px;width:350px;top:-15px;left:calc(50% - 175px);border-radius:50%;border:1px solid #fff}
#sharePopup .yinghe-circle-inner::before,#sharePopup .yinghe-circle-inner::after{content:'';position:absolute;border-radius:50%;border:1px solid #fff}
#sharePopup .yinghe-circle-inner::before{height:250px;width:250px;top:15%;left:calc(100% - 300px)}
#sharePopup .yinghe-circle-inner::after{height:150px;width:150px;top:30%;left:calc(100% - 250px)}
#sharePopup .share-icon{position:absolute;width:34px;height:34px;box-sizing:content-box;z-index:2;display:flex;align-items:center;justify-content:center}
#sharePopup .share-icon::after{content:'';position:absolute;height:100%;width:100%;border-radius:20px;border:1px solid #fff;background:rgba(255,255,255,.7);z-index:-1;left:0}
#sharePopup .share-icon img{height:18px}
#sharePopup .share-icon.xhs,#sharePopup .share-icon.bili{width:auto;padding:0 10px;height:26px}
#sharePopup .share-icon.bili img{height:12px}
#sharePopup .share-icon.xhs img{height:11px}
#sharePopup .share-icon.douyin img{height:16px}
#sharePopup .share-icon.weixin img{height:20px}
#sharePopup .share-icon.douyin{left:100px;top:13%}
#sharePopup .share-icon.kuaishou{right:-15px;top:35%}
#sharePopup .share-icon.bili{left:-20px;top:38%}
#sharePopup .share-icon.weixin{left:50px;top:28%}
#sharePopup .share-icon.qq{right:50px;top:28%}
#sharePopup .share-icon.xhs{right:95px;top:15%}
#sharePopup .share-icon.weibo{left:15px;top:14%}
#sharePopup .share-icon.douban{right:15px;top:15%}
#sharePopup .share-logo{width:100%;text-align:center;line-height:0;margin-top:-50px;z-index:3;position:relative}
#sharePopup .share-logo img{width:150px;height:auto;display:inline-block}
#sharePopup .share-main{position:relative;z-index:2;background:#fff;box-shadow:0 3px 10px rgba(220,228,234,.7);border-radius:14px;padding:28px 25px;margin:0}
#sharePopup .share-success{font-weight:700;text-align:center;font-size:16px;color:green}
#sharePopup .share-text{margin:15px 0 0;font-size:14px;line-height:1.75;color:rgba(0,0,0,.92)}
#sharePopup .share-footer-link{margin-top:auto;padding:20px 0;text-align:center;font-size:14px;line-height:1}
#sharePopup .share-footer-link strong{position:relative;display:inline-block;color:#283593}
#sharePopup .share-footer-link strong::before,#sharePopup .share-footer-link strong::after{content:'';position:absolute;height:1px;width:20px;top:50%;background-color:#b7cfd5}
#sharePopup .share-footer-link strong::before{left:-35px}
#sharePopup .share-footer-link strong::after{right:-35px}
#sharePopup .share-close{position:absolute;top:6px;right:6px;z-index:5;cursor:pointer;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background:rgba(0,0,0,.15);color:#eee;font-size:12px;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);transition:background-color .2s,color .2s}
#sharePopup .share-close:hover{color:#283593}
html.dark-mode #sharePopup .share-content{background-image:radial-gradient(farthest-corner at 50% 20%,#4e4d4d 0%,#2f2f2f 100%)}
html.dark-mode #sharePopup .share-main{background:#252525;box-shadow:0 3px 10px #323232}
html.dark-mode #sharePopup .share-text{color:#e0e0e0}
html.dark-mode #sharePopup .share-success{color:#01dc01}
html.dark-mode #sharePopup .yinghe-circle-inner,html.dark-mode #sharePopup .yinghe-circle-inner::before,html.dark-mode #sharePopup .yinghe-circle-inner::after{border-color:#545454}
html.dark-mode #sharePopup .share-icon::after{background:#d8d8d8;border-width:0}
html.dark-mode #sharePopup .share-footer-link strong{color:#e5c977}`;
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
  // 侧边栏按钮统一容器：纵向排列、固定间距
  const sideStack = el('div', { id: 'sideStack' });
  // 公告按钮（右侧竖排文字）
  const btn = el('a', { className: 'btn-myRewards', title: '公告 ● 支持' }, sideStack);
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
  const sheng = el('a', { id: 'shengBtn', href: SHENG_URL, target: '_blank', title: '每天帮你省一点' }, sideStack);
  sheng.textContent = '省钱助手';

  /* ==================== 失效反馈（选择模式） ==================== */
  const fbBtn = el('button', { id: 'feedbackBtn' }, sideStack);
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

  /* ==================== 分享 ==================== */
  const SHARE_ICONS = [
    { cls: 'douyin', alt: '抖音', src: 'https://wework.qpic.cn/wwpic3az/427285_s4t50-gWQYOwC8R_1792385255/0' },
    { cls: 'kuaishou', alt: '快手', src: 'https://wework.qpic.cn/wwpic3az/942900_5Rd-JY4mQ9W2zYh_1792385265/0' },
    { cls: 'bili', alt: '哔哩哔哩', src: 'https://wework.qpic.cn/wwpic3az/920932_1QFy66pwQQCLRff_1792385190/0' },
    { cls: 'weixin', alt: '微信好友', src: 'https://wework.qpic.cn/wwpic3az/429458_ztufFKz-Qc2nRiJ_1792385278/0' },
    { cls: 'qq', alt: 'QQ好友', src: 'https://wework.qpic.cn/wwpic3az/773750_FlwP_twnQw-wEMF_1792385288/0' },
    { cls: 'xhs', alt: '小红书', src: 'https://wework.qpic.cn/wwpic3az/465683_nnLYVJLQSUGUN44_1792385299/0' },
    { cls: 'weibo', alt: '微博', src: 'https://wework.qpic.cn/wwpic3az/740982_oEgyxwoVSseWRoK_1792385308/0' },
    { cls: 'douban', alt: '豆瓣', src: 'https://wework.qpic.cn/wwpic3az/174911_De2tmQr5RR-GIRT_1792385246/0' }
  ];

  const shareBtn = el('button', { id: 'shareBtn', title: '分享网站给你的好友' }, sideStack);
  shareBtn.innerHTML = '<svg viewBox="0 0 1233 1024" aria-hidden="true"><path d="M106.73 963.912a21.561 21.561 0 0 1-7.037-0.795 49.478 49.478 0 0 1-42.101-54.584C81.763 681.57 162.108 513.958 295.449 409.214A624.886 624.886 0 0 1 656.49 283.647l29.619-1.532V120.688c0-63.947 58.5-77.962 89.65-46.812l364.162 370.404a90.218 90.218 0 0 1-2.326 141.852l-354.8 361.041a55.152 55.152 0 0 1-96.46-38.186V736.21h-36.654c-133.34 0-375.85 26.498-502.95 205.118a43.974 43.974 0 0 1-39.718 22.696z" fill="currentColor"/></svg>';

  const popup = el('div', { id: 'sharePopup' });
  const overlay = el('div', { className: 'share-overlay' }, popup);
  const body = el('div', { className: 'share-body' }, popup);
  const content = el('div', { className: 'share-content' }, body);
  const circle = el('div', { className: 'yinghe-circle' }, content);
  const circleInner = el('div', { className: 'yinghe-circle-inner' }, circle);
  SHARE_ICONS.forEach(function (it) {
    const icon = el('div', { className: 'share-icon ' + it.cls }, circleInner);
    el('img', { src: it.src, alt: it.alt }, icon);
  });
  const logo = el('div', { className: 'share-logo' }, content);
  el('img', { src: 'https://wework.qpic.cn/wwpic3az/555512_htAkGfRvTA-lgqE_1792379866/0', alt: '阿虚同学的储物间' }, logo);
  const shareMain = el('div', { className: 'share-main' }, content);
  const shareOk = el('div', { className: 'share-success' }, shareMain);
  shareOk.textContent = '网址已复制，快去分享给朋友吧！';
  const shareText = el('div', { className: 'share-text' }, shareMain);
  shareText.innerHTML = '直接粘贴到微信、QQ发送即可。如果觉得网站还不错的话，也欢迎截图分享到小红书、微博、豆瓣，帮助更多人发现优质互联网资源！';
  const footerLink = el('div', { className: 'share-footer-link' }, content);
  const flA = el('a', { href: window.location.origin + window.location.pathname, target: '_blank', rel: 'noopener' }, footerLink);
  const flStrong = el('strong', {}, flA);
  flStrong.textContent = '阿虚同学的储物间';
  const closeX = el('div', { className: 'share-close', title: '关闭' }, body);
  closeX.textContent = '✕';

  function openShare() { popup.classList.add('open'); }
  function closeShare() { popup.classList.remove('open'); }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = el('textarea', { style: 'position:fixed;top:-1000px;left:-1000px;opacity:0' });
      ta.value = text;
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  shareBtn.addEventListener('click', function () {
    const text = '阿虚同学的储物间（尽量别在微信打开）：' + window.location.href.split('#')[0];
    copyText(text).then(openShare, function () {
      // 复制失败（如非安全上下文）也要给出分享入口
      openShare();
    });
  });
  closeX.addEventListener('click', closeShare);
  overlay.addEventListener('click', closeShare);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup.classList.contains('open')) closeShare();
  });

  /* ==================== 回到顶部 ==================== */
  const backTop = el('button', { id: 'backTopBtn', title: '回到顶部' });
  backTop.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2 10 15h28z"/><text x="24" y="38" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="bold">TOP</text></svg>';

  function toggleBackTop() {
    backTop.classList.toggle('show', window.scrollY > BACK_TOP_AFTER);
  }
  window.addEventListener('scroll', toggleBackTop, { passive: true });
  toggleBackTop();  // 页面可能直接打开在中间位置（锚点跳转 / 刷新恢复滚动）

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
