var code = ` <div id="{{boxId}}" style="top: 0;left: 0;width: 100vw;height: 100vh;background-color: #b2b2b269;position: absolute;z-index: 9999999;display: flex;justify-content: center;align-items: center;"><div style="width:300px;height:150px;background-color:#fff;border-radius:15px;position:relative;box-shadow:rgb(0 0 0/24%)0px 3px 8px;"> <div style="display: flex; align-items: center;"> <img style="display:flex;align-items:center;width:86px;border-radius:10px;margin:10px;" src="{{img}}" alt="" /> <div style="display:flex;flex-direction:column;"> <h2 style="display:flex;align-items:center;font-size:14px;margin:0 4px 6px 0;color: crimson;">{{title}}</h2> <p style="display:flex;align-items:center;font-size:12px;margin:0 4px 0 0;">{{content}}</p> </div> </div> <div style="display: flex;justify-content: center;padding: 0 12px;"> <button id="btnClose" style="padding:6px 24px;background-color:#fff;width:40%;font-size:16px;border-radius:10px;border:1px solid#ccc;">关闭</button> <a style="margin-left:6px;width:100%;color:#fff;background-color:#1866FC;display:flex;justify-content:center;align-items:center;text-decoration:none;border-radius:10px;border:1px solid#ccc;" href="{{path}}">点击查看</a> </div> </div> </div>`;
var infoList = [
  {
    title: "【莆田珂珂得物鞋厂】",
    content: "【得物】货莆田鞋厂nike倒钩￥85//空军￥65专柜1.1鞋厂全网货源！请点击！",
    link: "https://sourl.cn/czHN7i \"target=\"_self\"",
    img: "http://p1.music.126.net/_-wHuTt7mEAzGJ-6c8nT0A==/109951169771415737.jpg",
  },
  {
    title: "阿虚自营店铺丨运营商授权",
    content: "线下运营商不会透露的宝藏流量卡，低至19/月188G流量！电信、联通、移动任选，资费官方APP可查，能打电话发短信，免费包邮！",
    link: "https://axu.simhaoka.com/phone/index?id=B956B2050EAA74084CC3FE6EF37C57CF \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/809505_IM7dj_IjRTOVqft_1712198786/0",
  },
  {
    title: "抖音豆包AI丨可实时对话！",
    content: "字节跳动旗下免费AI！支持聊天对话、读取文件、联网搜索，拍照解题、翻译写文，超3000W用户的黑马级全能选手！",
    link: "https://m.paluai.com/?code=dh01 \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/608488_cjHDpb7nSomla08_1720751142/0",
  },
  {
    title: "帮阿虚涨涨文章阅读量吧！",
    content: "最近被限流的太严重，公众号简直要做不下去了！大家帮忙打开微信看一下最新文章，涨点阅读量吧！（或者点击查看快速跳转微信）",
    link: "https://work.weixin.qq.com/kfid/kfcd40df0818c5c9d78 \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/990172_8iKFKqBgQIiIAZP_1720788549/0",
  },
];

function setCookie() {
  var date = new Date();
  var Hour = 4; //设置每小时过期时间
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