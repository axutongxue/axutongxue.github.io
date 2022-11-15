    var cssCode =
      "<style>html,body{overflow: hidden;}.box { top: 0; left: 0; width: 100vw; height: 100vh; background-color: #b2b2b269; position: absolute; z-index: 9999999; display: flex; justify-content: center; align-items: center;}.pop-ups { width: 300px; height: 150px; background-color: #fff; border-radius: 15px; position: relative;box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;}.top-info { display: flex; align-items: center; /* flex-direction: column; */ /* float: right; */}.decrition { /*padding-bottom: 12px;*/ display: flex; flex-direction: column;}.top-info img { width: 86px; border-radius: 10px; margin: 10px;}.top-info h2 {font-size: 14px;margin: 0 0 6 0;}.top-info p {font-size:12px;margin: 0 4 0 0;}.bottom-button { display: flex; justify-content: center; padding: 0 12px;}.bottom-button button,.bottom-button a { border-radius: 10px; border: 1px solid #ccc;}.bottom-button a { display: flex; justify-content: center; align-items: center; text-decoration: none;}.bottom-button .close {padding:6px 24px;background-color:#fff;width:40%;font-size:16px;}.bottom-button .success { margin-left: 6px; width: 100%; color: #fff; background-color: #1866FC;}</style>";
    var code = ` <div id="{{boxId}}" class="box"> ${cssCode}<div class="pop-ups"> <div class="top-info"> <img src="{{img}}" alt="" /> <div class="decrition"> <h2>{{title}}</h2> <p>{{content}}</p> </div> </div> <div class="bottom-button"> <button id="btnClose" class="close">关闭</button> <a class="success" href="{{path}}">点击查看</a> </div> </div> </div>`;
    var infoList = [
      {
        title: "冷门衣服收纳神器",
        content: "多番对比、逛淘宝到凌晨4点，阿虚买过最好用的衣服收纳神器！",
        link: "https://mp.weixin.qq.com/s/k-TFWqSRcc3uATJXXdcGXg \"target=\"_self\"" ,
        img: "http://img.mail.sina.com/signature/9d31f5319985c64329c237b7c61bc41147306b4d/6373ac57f2865.jpg",
      },
      {
        title: "张城银不锈钢锻打菜刀（阿虚大哥的店铺）",
        content: "张师傅是我家老朋友了，他的菜刀驰名厨师界，阿虚家还有亲戚基本上都在用！",
        link: "https://p.pinduoduo.com/oXgAXO8g \"target=\"_self\"" , 
        img: "http://img.mail.sina.com/signature/9d31f5319985c64329c237b7c61bc41147306b4d/6373ae08ad0d2.jpg",
      },
      {
        title: "海露玻璃酸钠滴眼药水",
        content: "人工泪液，缓解视疲劳、干眼症必备！天猫OTC热卖榜第1名，折后价仅需78.8元，阿虚强推👍",
        link: "https://m.tb.cn/h.U6glUXq \"target=\"_self\"" ,
        img: "http://img.mail.sina.com/signature/9d31f5319985c64329c237b7c61bc41147306b4d/6373b0850a332.jpg",
      },
      {
        title: "Vitafusion褪黑素",
        content: "失眠必备！1件减35元／2件减90，到手价仅需84元，还你一晚香甜～",
        link: "https://m.tb.cn/h.UT9Qlev \"target=\"_self\"" ,
        img: "http://img.mail.sina.com/signature/9d31f5319985c64329c237b7c61bc41147306b4d/6373b36a4a480.jpg",
      },
    ];

    function setCookie() {
      var date = new Date();
      var Hour = 6; //设置每小时过期时间
      let expireTime = Hour * 3600* 1000;
      let expires = date.getTime() + expireTime;
      date.setTime(expires);
      document.cookie =
        "ad=" + RandomNumBoth(1, 10000) + "; expires=" + date.toGMTString();
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
      if (!getCookie("ad")) {
        setCookie();
        let btnClose = document.querySelector("#btnClose");

        if (btnClose) {
          return;
        }
        let ad = infoList[RandomNumBoth(0, infoList.length - 1)];
        let boxId = RandomNumBoth(10000, 100000);

        let newCode = code.replace("{{title}}", ad.title);
        newCode = newCode.replace("{{content}}", ad.content);
        newCode = newCode.replace("{{path}}", ad.link);
        newCode = newCode.replace("{{img}}", ad.img);
        newCode = newCode.replace("{{boxId}}", boxId);
        // alert("弹出广告窗");
        let div = document.createElement("div");
        div.innerHTML = newCode;
        document.body.appendChild(div);
        btnClose = document.querySelector("#btnClose");

        btnClose.onclick = function () {
          document.getElementById(boxId).remove();
        };
        // setTimeout(function () {
        //   document.getElementById(boxId).style.display = "block";
        // }, 50);
      } else {
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
    }
    function RandomNumBoth(Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      var num = Min + Math.round(Rand * Range); //四舍五入
      return num;
    }
    checkCookie();