function randomString(length) {
    var str = 'abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}
var id = randomString(6);
var roll = randomString(6);

document.write('<style>#'+id+'{height:50px;overflow:hidden;width:290px;border:dashed 0.5px #07c160;margin: 4 auto 4 auto;}.'+roll+' li{font-size:9px;text-indent:-35px;padding-top:4px}.icon{width:25px;margin-right:4;vertical-align:-40%}</style>');
document.write('<div id='+id+'><ul class="'+roll+'"><li><img class="icon" src="https://i2.100024.xyz/2022/11/14/1113jkv.webp"><a href="https://vip.mingfengtang.com/bzjingpi/?dhid=3167">2022生辰八字运程精批，推断你一整年运势好坏！</a></li><li><img class="icon" src="https://i2.100024.xyz/2022/11/14/110qyh4.webp"><a href="https://vip.mingfengtang.com/bazihehun/?dhid=3167">你会在几岁遇到正缘，多少岁结婚？原来姻缘早已注定</a></li><li><img class="icon"src="https://i2.100024.xyz/2022/11/14/110l6qx.webp"><a href="https://vip.mingfengtang.com/xingzuopeidui/?dhid=3167">星盘配对，窥探幸福：揭开你跟TA的缘分密码！</a></li><li><img class="icon"src="https://i2.100024.xyz/2022/11/14/1102zwb.webp"><a href="https://vip.mingfengtang.com/bzqm/?dhid=3167">赐子千金，不如教子一艺；教子一艺，不如赐子好名！</a></li><li><li><img class="icon"src="https://i2.100024.xyz/2022/11/14/10zb1bw.webp"><a href="https://vip.mingfengtang.com/wxqs/?dhid=3167">洞悉五行，助运一生：看看你的五行缺什么？</a></li><li><img class="icon"src="https://i2.100024.xyz/2022/11/14/10ziu76.webp"><a href="https://vip.mingfengtang.com/taluopd/?dhid=3167">塔罗牌配对：立即揭晓你们之间的缘分</a></li><li><img class="icon"src="https://i2.100024.xyz/2022/11/14/10zvm74.webp"><a href="https://vip.mingfengtang.com/liunian2022/?dhid=3167">如何顺势而上？2022虎年运程详批！</a></li></ul></div>');

$(function() {
    var $this = $("#"+id);
    var scrollTimer;
    $this.hover(function() {
        clearInterval(scrollTimer);
    }, function() {
        scrollTimer = setInterval(function() {
            scrollNews($this);
        }, 2000);
    }).trigger("mouseleave");

    function scrollNews(obj) {
        var $self = obj.find("ul");
        var lineHeight = $self.find("li:first").height();
        $self.animate({
            "marginTop": -lineHeight + "px"
        }, 500, function() {
            $self.css({
                marginTop: 0
            }).find("li:first").appendTo($self);
        })
    }
})