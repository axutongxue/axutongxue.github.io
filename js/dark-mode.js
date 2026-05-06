function getModeCookie(c) {
    var cookies = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < cookies.length; i++) {
        var item = cookies[i].split("=");
        var name = item.shift().trim();
        if (name === c) {
            return decodeURIComponent(item.join("="));
        }
    }
    return null;
}
function setModeCookie(c, d) {
    var expires = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = c + "=" + encodeURIComponent(d) + "; expires=" + expires + "; path=/; SameSite=Lax";
}
function adddarkcss() {
    if (document.querySelector('link[href*="../css/dark-mode.css"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../css/dark-mode.css";
    document.head.appendChild(link);
}
function removedarkcss() {
    var links = document.querySelectorAll('link[href*="../css/dark-mode.css"]');
    for (var i = links.length - 1; i >= 0; i--) {
        links[i].parentNode.removeChild(links[i]);
    }
}
function bedark() {
    if (getModeCookie("status") === "dark") {
        adddarkcss();
    }
}
bedark();
function changemode() {
    if (getModeCookie("status") === "dark") {
        removedarkcss();
        setModeCookie("status", "light");
    } else {
        adddarkcss();
        setModeCookie("status", "dark");
    }
}
