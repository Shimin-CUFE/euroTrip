$(document).ready(function () {
    //时间
    let a = new Date();
    let b = a.toLocaleTimeString();
    let c = a.toLocaleDateString();
    $("#time").html(c + "&nbsp;" + b);
    //行程
    let reg = new RegExp("(^|&)" + "data" + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        data = JSON.parse(decodeURI(r[2]));
        //显示页面
        let head = $("#result-head");
        let foot = $("#result-foot");
        for (let x = data.cities.length - 1; x >= 0; x--) {
            head.after("<h4>城市" + (x + 1) + "：" + data.cities[x] + "</h4>");
            if (x >= 1) head.after("<h4>交通方式：" + data.traffic[x - 1] + "</h4>");
        }
        foot.after("<h4>总预算：" + data.budget.toString() + "</h4>");
        foot.after("<h4>总时间：" + data.days.toString() + "</h4>");
    } else return null;
});