var code = ` <div id="{{boxId}}" style="top: 0;left: 0;width: 100vw;height: 100vh;background-color: #b2b2b269;position: absolute;z-index: 9999999;display: flex;justify-content: center;align-items: center;"><div style="width:300px;height:150px;background-color:#fff;border-radius:15px;position:relative;box-shadow:rgb(0 0 0/24%)0px 3px 8px;"> <div style="display: flex; align-items: center;"> <img style="display:flex;align-items:center;width:86px;border-radius:10px;margin:10px;" src="{{img}}" alt="" /> <div style="display:flex;flex-direction:column;"> <h2 style="display:flex;align-items:center;font-size:14px;margin:0 4px 6px 0;color: crimson;">{{title}}</h2> <p style="display:flex;align-items:center;font-size:12px;margin:0 4px 0 0;">{{content}}</p> </div> </div> <div style="display: flex;justify-content: center;padding: 0 12px;"> <button id="btnClose" style="padding:6px 24px;background-color:#fff;width:40%;font-size:16px;border-radius:10px;border:1px solid#ccc;">关闭</button> <a style="margin-left:6px;width:100%;color:#fff;background-color:#1866FC;display:flex;justify-content:center;align-items:center;text-decoration:none;border-radius:10px;border:1px solid#ccc;" href="{{path}}">点击查看</a> </div> </div> </div>`;
var infoList = [
  {
    title: "阿虚自营店铺丨运营商授权",
    content: "低至19/月 192G 流量！电信、联通、移动任选，资费官方APP可查，能打电话发短信，免费包邮！",
    link: "https://axu.simhaoka.com/phone/index?id=B956B2050EAA74084CC3FE6EF37C57CF \"target=\"_self\"",
    img: "https://wework.qpic.cn/wwpic3az/809505_IM7dj_IjRTOVqft_1712198786/0",
  },
  {
     title: "【阿虚推荐】莆田潮牌鞋服",
     content: "主营耐克、阿迪、匡威、新百伦、万斯、彪马、斐乐等各大品牌鞋子、服饰；还有名牌手表、耳机、包包、音响等！全网最高性价比",
     link: "https://xie.yixuev.com?axutongxuehttps://xie.yixuev.com?axutongxue \"target=\"_self\"",
     img: "https://help-ol.bj.bcebos.com/MTgzLjIyMC45NS4xNzEsIDE4My4yMjAuOTUuMTcxff73cbf6ae00b25929d5fbcbc7e8b411.jpg",
   },
  {
      title: "网易丨AI产品经理孵化营",
      content: "非常适合想要进入AI赛道，缺乏职业发展规划的大学生🙋‍♂️，薪资相较传统产品经理更可观，报名即送２节免费课和免费AI资料！",
      link: "http://ytiao.cn/BeAguc \"target=\"_self\"",
      img: "http://cbu01.alicdn.com/i4/2793632751/O1CN01coXazi1WC0Zrjou0V_!!2793632751-2-cbucrm.png",
  },
];

function setCookie() {
  var date = new Date();
  var Hour = 5; //设置每小时过期时间
  let expireTime = Hour * 3600 * 1000;
  let expires = date.getTime() + expireTime;
  date.setTime(expires);
  document.cookie =
    "axutognxue=" + RandomNumBoth(10000, 100000) + "; expires=" + date.toGMTString();
  document.cookie =
    "timeexp=" + expires + "; expires=" + date.toGMTString();
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
    if (!getCookie("axutognxue")) {
      setCookie();
      let btnClose = document.querySelector("#btnClose");
      if (btnClose) {
        return;
      }
      let axutognxue = infoList[RandomNumBoth(0, infoList.length - 1)];
      let boxId = RandomNumBoth(10000, 100000);
      let newCode = code.replace("{{title}}", axutognxue.title);
      newCode = newCode.replace("{{content}}", axutognxue.content);
      newCode = newCode.replace("{{path}}", axutognxue.link);
      newCode = newCode.replace("{{img}}", axutognxue.img);
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
      let timeOut = getCookie("timeexp") ?? 1000;
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
