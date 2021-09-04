	function getCookie(name) {           
	    var arr = document.cookie.split(';');           
	    for (var i = 0; i < arr.length; i++) {
	        var arr2 = arr[i].split('=');
	        var arrTest = arr2[0].trim();
	        if (arrTest == name) {         
	            return arr2[1];
	        }
	    }
	
	}
	function setCookie(name, value) {
        var date = new Date();
        var expires = 10;
        date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
        document.cookie = name + "=" + value + ";expires=" + date.toGMTString() + ";path=" + "/";
    }
	function adddarkcss(){
		var creatHead = $('head');
		creatHead.append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/axutongxue/axutongxue.github.io@main/cdn/dark-mode.css">');
		}
	function removedarkcss(){
		var allsuspects=document.getElementsByTagName('link');
		for (var i=allsuspects.length; i>=0;i--){
		if (allsuspects[i] &&allsuspects[i].getAttribute('href')!=null && allsuspects[i].getAttribute('href').indexOf('https://cdn.jsdelivr.net/gh/axutongxue/axutongxue.github.io@main/cdn/dark-mode.css')!=-1)
		  allsuspects[i].parentNode.removeChild(allsuspects[i]);
		}
	}
	//页面一加载就判断是否是暗色模式
	function bedark(){
		var status=getCookie("status");
		if (status=="dark"){
			adddarkcss();		
		}
	}
	bedark();
	function changemode(){
		var status=getCookie("status");
		if (status=="dark"){
			removedarkcss();			
			setCookie("status", "light");
		}
		else{
			adddarkcss();
			setCookie("status", "dark");
		}				
	}