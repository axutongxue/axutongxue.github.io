function randomString(c) {
    var d = "abcdefghijklmnopqrstuvwxyz";
    var a = "";
    for (var b = c; b > 0; --b) {
        a += d[Math.floor(Math.random() * d.length)]
    }
    return a
}
var id = randomString(5);
var roll = randomString(6);
document.write("<style>#" + id + "{height:58px;overflow:hidden;width:322px;border:dashed 0.5px #07c160;margin: 4 auto 4 auto;}." + roll + " li{font-size:12px;text-indent:-30px;padding: 2 0 2 0;line-height:1;}.icon{width:24px;margin-right:2;vertical-align:middle}</style>");
document.write("<article id=" + id + '><ul class="' + roll + '" style="margin-block:0px;padding-inline-start:33px;"><li><img class="icon" src="https://wework.qpic.cn/wwpic/654570_DIJtzL7fQx-GQFM_1669981454/0"><a href="https://docs.qq.com/doc/DZFNwQmJ4SVhNcVRn">莆田珂珂鞋厂，自家工厂，全网最低价格，最高品质！</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/367806_ZWOr3OjRT1ajZNh_1672843483/0"><a href="https://wework.qpic.cn/wwpic/400651_NMTe-z7vQma1v-A_1672842611">同程旅行活动：原价25/月优酷会员仅需10元/月！</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/40156_9DIqRwHnRXaMQPY_1672843718"><a href="https://wework.qpic.cn/wwpic/395395_Af60qTGzSlKBpeG_1672842611/0">同程旅行活动：原价25/月爱奇艺＆腾讯视频会员仅需12元/月！</a></li><li><img class="icon" src="https://p1.music.126.net/xdWqah0JXvPwDGXwWiv2rQ==/109951168114272525.png"><a href="https://wework.qpic.cn/wwpic/747121_w3GZjcdWQzWZsJH_1672920087">同程旅行活动：原价15/月QQ音乐会员仅需8元／月！</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/770968_o07Z3IsIQCe_s7m_1670299441/0"><a href="https://flowus.cn/share/0ee85362-74eb-4167-9a1c-3622204ee815">魔音工坊：AI配音神器，注册即领会员，购买享9折！</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/462197_07Ti87bDSP6G9zz_1670299439/0"><a href="https://flowus.cn/share/17ef16a2-5974-4b7a-9e54-3fe62496591c">魔撰写作：AI写作神器，注册即领会员，购买享3折！</a></li><li><img class="icon" src="https://p1.music.126.net/uzFqzAAo5zWVIPobOsZOZQ==/109951168120312415.png"><a href="https://flowus.cn/share/1c2067a2-82eb-460b-afd5-77b7bf591b3b">尚德考研丨价值699元在职研考研资料，限额0元领取</a></li></ul></article>');
$(function() {
    var c = $("#" + id);
    var b;
    c.hover(function() {
        clearInterval(b)
    },
    function() {
        b = setInterval(function() {
            a(c)
        },
        2000)
    }).trigger("mouseleave");
    function a(e) {
        var f = e.find("ul");
        var d = f.find("li:first").height();
        f.animate({
            marginTop: -d + "px"
        },
        500,
        function() {
            f.css({
                marginTop: 0
            }).find("li:first").appendTo(f)
        })
    }
});