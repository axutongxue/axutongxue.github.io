﻿function randomString(c){var d="abcdefghijklmnopqrstuvwxyz";var a="";for(var b=c;b>0;--b){a+=d[Math.floor(Math.random()*d.length)]}return a}var id=randomString(5);var roll=randomString(6);document.write("<style>#"+id+"{height:58px;overflow:hidden;width:322px;border:dashed 0.5px #07c160;margin: 4 auto 4 auto;}."+roll+" li{font-size:12px;text-indent:-30px;padding: 2 0 2 0;line-height:1;}.icon{width:24px;margin-right:2;vertical-align:middle}</style>");document.write("<article id="+id+'><ul class="'+roll+'" style="margin-block:0px;padding-inline-start:33px;"><li><img class="icon" src="https://wework.qpic.cn/wwpic/522455_UYKgnWMtSOima7J_1676521068/0"><a href="https://docs.qq.com/doc/DZFNwQmJ4SVhNcVRn">莆田珂珂鞋厂，自家工厂，全网最低价格，最高品质！</a></li><li><img class="icon" src="https://pp.myapp.com/ma_icon/0/icon_53290304_1667901684/256"><a href="https://sj.qq.com/appdetail/com.miaoxiaoer.app">低价会员／电影票优惠／93折充话费／外卖优惠／快餐饮品优惠点餐...【阿虚邀请码110011】</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/770968_o07Z3IsIQCe_s7m_1670299441/0"><a href="https://flowus.cn/share/0ee85362-74eb-4167-9a1c-3622204ee815">魔音工坊：AI配音神器，注册即领会员，购买享9折！</a></li><li><img class="icon" src="https://wework.qpic.cn/wwpic/462197_07Ti87bDSP6G9zz_1670299439/0"><a href="https://flowus.cn/share/17ef16a2-5974-4b7a-9e54-3fe62496591c">魔撰写作：AI写作神器，注册即领会员，购买享3折！</a></li><li><img class="icon" src="https://p1.music.126.net/uzFqzAAo5zWVIPobOsZOZQ==/109951168120312415.png"><a href="https://flowus.cn/share/1c2067a2-82eb-460b-afd5-77b7bf591b3b">尚德考研丨价值699元在职研考研资料，限额0元领取</a></li></ul></article>');$(function(){var c=$("#"+id);var b;c.hover(function(){clearInterval(b)},function(){b=setInterval(function(){a(c)},2000)}).trigger("mouseleave");function a(e){var f=e.find("ul");var d=f.find("li:first").height();f.animate({marginTop:-d+"px"},500,function(){f.css({marginTop:0}).find("li:first").appendTo(f)})}});