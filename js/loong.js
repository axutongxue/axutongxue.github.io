var code = ` <div id="{{boxId}}" style="top: 0;left: 0;width: 100vw;height: 100vh;background-color: #b2b2b269;position: absolute;z-index: 9999999;display: flex;justify-content: center;align-items: center;"><div style="width:300px;height:150px;background-color:#fff;border-radius:15px;position:relative;box-shadow:rgb(0 0 0/24%)0px 3px 8px;"> <div style="display: flex; align-items: center;"> <img style="display:flex;align-items:center;width:86px;border-radius:10px;margin:10px;" src="{{img}}" alt="" /> <div style="display:flex;flex-direction:column;"> <h2 style="display:flex;align-items:center;font-size:14px;margin:0 4px 6px 0;color: crimson;">{{title}}</h2> <p style="display:flex;align-items:center;font-size:12px;margin:0 4px 0 0;">{{content}}</p> </div> </div> <div style="display: flex;justify-content: center;padding: 0 12px;"> <button id="btnClose" style="padding:6px 24px;background-color:#fff;width:40%;font-size:16px;border-radius:10px;border:1px solid#ccc;">关闭</button> <a style="margin-left:6px;width:100%;color:#fff;background-color:#1866FC;display:flex;justify-content:center;align-items:center;text-decoration:none;border-radius:10px;border:1px solid#ccc;" href="{{path}}">点击查看</a> </div> </div> </div>`;
var infoList = [
  {
    title: "【莆田珂珂得物鞋厂】",
    content: "【得物】货莆田鞋厂nike倒钩￥85//空军￥65专柜1.1鞋厂全网货源！请点击！",
    link: "https://sourl.cn/czHN7i \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/861904_N5FEgY-XQ7OrTwe_1718167955/0",
  },
  {
    title: "阿虚的店铺丨运营商直营授权",
    content: "低至19/月188G流量！电信、联通、移动、广电套餐任选，可打电话发短信，免费包邮放心选购！",
    link: "https://axu.simhaoka.com/phone/index?id=B956B2050EAA74084CC3FE6EF37C57CF \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/809505_IM7dj_IjRTOVqft_1712198786/0",
  },
  {
    title: "教育部出品丨高考志愿填报",
    content: "近期是各位高考生填志愿的关键时刻，大家可以把这篇文章转发给你身边的高考生看看！良心高考志愿填报辅助工具",
    link: "https://work.weixin.qq.com/kfid/kfcd40df0818c5c9d78 \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/103467_Q3MRimUNTIWzsoz_1719204576/0",
  },
  {
    title: "抢疯了！云电脑仅需36块钱一年",
    content: "阿里云618大促还没结束，36元服务器秒没，挂网课、挂网盘下载、挂BT下载、云游戏、搭私服等作用多多，速抢！",
    link: "https://www.aliyun.com/activity/Mid-promotion/lqfx618?clubTaskBiz=subTask..11444113..10213..&userCode=mafx9aa9 \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/979881_-RFNJK-LSfWceTD_1719205053/0",
  },  
];

function setCookie() {
  var date = new Date();
  var Hour = 6; //设置每小时过期时间
  let expireTime = Hour * 3600 * 1000;
  let expires = date.getTime() + expireTime;
  date.setTime(expires);
  document.cookie =
    "a1d=" + RandomNumBoth(10000, 100000) + "; expires=" + date.toGMTString();
  document.cookie =
    "testexp=" + expires + "; expires=" + date.toGMTString();
  // 过了这个时间就没用过期时间
  setTimeout(() => {
    checkCookie();
  }, expireTime + 10);
}

function getCookie(cookie_name) {
  var results = document.cookie.match(
    "(^|;) ?" + cookie_name + "=([^;]*)(;|$)"
  );
  if (results) return unescape(results[2]);
  else return null;
}
function checkCookie() {
  setTimeout(function () {
    if (!getCookie("a1d")) {
      setCookie();
      let btnClose = document.querySelector("#btnClose");
      if (btnClose) {
        return;
      }
      let a1d = infoList[RandomNumBoth(0, infoList.length - 1)];
      let boxId = RandomNumBoth(10000, 100000);
      let newCode = code.replace("{{title}}", a1d.title);
      newCode = newCode.replace("{{content}}", a1d.content);
      newCode = newCode.replace("{{path}}", a1d.link);
      newCode = newCode.replace("{{img}}", a1d.img);
      newCode = newCode.replace("{{boxId}}", boxId);

      let div = document.createElement("div");
      div.innerHTML = newCode;
      document.body.appendChild(div);
      btnClose = document.querySelector("#btnClose");

      btnClose.onclick = function () {
        document.getElementById(boxId).remove();
      };
    }
    else {
      let timeOut = getCookie("testexp") ?? 1000;
      if (timeOut >= 1000) {
        timeOut = timeOut - new Date().getTime();
        if (timeOut < 0) {
          checkCookie();
          return;
        }
      }
      console.log(timeOut);
        setTimeout(function () {
        checkCookie();
      }, timeOut);
    }
  }, 2000);//延时2秒展示
}
  function RandomNumBoth(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range); //四舍五入
  return num;
}
checkCookie();