$(document).ready(function () {
    //准备常量
    selected_days = 0;
    selected_budget = 0;
    user_days = 0;
    user_budget = 0;
    city_list = [];
    route_list = [];
    user_selection = {
        'city_list': [],
        'traffic': [],
        'days': [],
        'traffic_days': [],
        'city_fees': [],
        'traffic_fees': []
    };

    //加载百度地图
    map = new BMapGL.Map("container");// 创建地图实例
    var initPoint = new BMapGL.Point(7.718548, 50.067641);// 创建点坐标
    map.centerAndZoom(initPoint, 6);// 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放

    $.ajax({
        type: "GET",
        url: "/euroTrip/routing_ajax_init",
        success: function (jsonData) {
            var data = JSON.parse(jsonData);
            var cities = JSON.parse(data.city);
            var routes = JSON.parse(data.route);
            var city_area = document.getElementsByClassName("city-area")[0];
            //Show city list
            for (x in cities) {
                var city = JSON.parse(cities[x]);
                city_list.push(city)
                //城市按钮 TODO: 用jQuery重构+popover显示城市信息
                var button1 = document.createElement("input");
                button1.setAttribute("type", "button");
                button1.setAttribute("value", city.city_name);
                button1.setAttribute("id", city.city_id);
                button1.setAttribute("class", "btn city-btn");
                button1.setAttribute("data-toggle", "popover");
                var onclick_fn = "appendCity(" + city.city_id + ", " + city.city_x + ", " + city.city_y + ");";
                button1.setAttribute("onclick", onclick_fn);
                city_area.appendChild(button1);
                city_area.appendChild(document.createElement("br"));
                //输入城市天数
                var day = document.createElement("input");
                day.setAttribute("type", "number");
                day.setAttribute("id", city.city_id + "-days");
                day.setAttribute("class", "form-control city-days-input");
                city_area.appendChild(day);
                //每个城市分行显示
                city_area.appendChild(document.createElement("br"));
            }
            for (let x in routes) {
                //TODO: 用jQuery重构
                var route = JSON.parse(routes[x])
                route_list.push(route);
            }
        },
        error: function () {
            alert("获取城市信息错误");
        }
    });
    //实时更新限制条件
    $("#trip-days").bind("input propertychange", updateConstraint);
    $("#trip-budget").bind("input propertychange", updateConstraint);
});

function updateConstraint() {
    var days = $("#trip-days");
    var budget = $("#trip-budget");
    $("#days-info").val(days.val());
    $("#budget-info").val(budget.val());
    if (budget.val() !== "" && days.val() !== "") {
        $("#main-function").removeAttr("hidden");
    }
    user_days = Number(days.val());
    user_budget = Number(budget.val());
}

function appendCity(city_id, city_x, city_y) {
    //新增城市
    if (user_selection.city_list.includes(city_id)) {
        if (user_selection.city_list[user_selection.city_list.length - 1] === city_id) {
            // 重复点击时删除最后一个城市
            deleteMapOverlay(city_x, city_y);
            user_selection.city_list.pop();
            selected_budget -= user_selection.city_fees.pop();
            selected_budget -= user_selection.traffic_fees.pop();
            selected_days -= user_selection.days.pop();
            selected_days -= user_selection.traffic_days.pop();
            user_selection.traffic.pop();
            if (isNaN(selected_days)) {
                selected_days = 0;
            }
            $("#" + user_selection.city_list[user_selection.city_list.length - 1] + "-days").removeAttr("disabled");
            $("#" + user_selection.city_list[user_selection.city_list.length - 1]).removeAttr("disabled");
        } else {
            alert("您已经选择过该城市，请勿重复选择！");
        }
    } else {
        //检查budget限制
        for (x in city_list) {
            if (city_list[x].city_id === city_id) {
                curr_price = city_list[x].city_price;
                selected_budget += curr_price;
                user_selection.city_fees.push(curr_price);
                if (selected_budget > user_budget) {
                    alert("您的预算不足！");
                    selected_budget -= user_selection.city_fees.pop();
                    return;
                }
            }
        }
        if (user_selection.city_list.length > 0) {
            var last_city_id = user_selection.city_list[user_selection.city_list.length - 1];
            //检查days限制
            var days_input = $("#" + last_city_id + "-days");
            var last_city_days = Number(days_input.val());
            if (last_city_days === 0) {
                alert("请先输入第" + user_selection.city_list.length + "个城市的天数！");
                selected_budget -= user_selection.city_fees.pop();
                return;
            }
            selected_days += last_city_days;
            user_selection.days.push(last_city_days);
            if (selected_days > user_days) {
                alert("您所选的第" + user_selection.city_list.length + "个城市天数超出预期天数！");
                selected_days -= user_selection.days.pop();
                selected_budget -= user_selection.city_fees.pop();
                if (isNaN(selected_days)) {
                    selected_days = 0;
                }
                return;
            }
            //禁用已选城市
            days_input.attr("disabled", "disabled");
            $("#" + last_city_id).attr("disabled", "disabled")
            //显示Modal
            showModal(last_city_id, city_id)
            //绘制路径
            for (x in city_list) {
                if (city_list[x].city_id === last_city_id) {
                    addMapLine(map, city_x, city_y, city_list[x].city_x, city_list[x].city_y);
                }
            }
        }
        user_selection.city_list.push(city_id);
        //绘制点
        addMapPoint(map, city_x, city_y);
    }
}

function showModal(from, to) {
    var route_div = $("#modal_route_list");
    route_div.empty();
    for (x in route_list) {
        if (route_list[x].route_city1 === from) {
            if (route_list[x].route_city2 === to) {
                let id = route_list[x].route_id;
                let type = route_list[x].route_type;
                let start = route_list[x].route_start;
                let finish = route_list[x].route_finish;
                let fee = route_list[x].route_fee;
                let day = start - finish > 12 ? 1 : 0;
                //添加元素
                route_div.append("<label>" + start + ":00-" + finish + ":00" + "</label><br>")
                route_div.append("<input type='button' class='btn btn-info route-btn' value='" + type + "' onclick='addTraffic(" + id + ", " + day + ", " + fee + ");'><br><br>");
            }
        }
    }
    $('#myModal').modal({backdrop: 'static', keyboard: false});
    $("#myModal").modal("show");
}

function addTraffic(id, day, fee) {
    user_selection.traffic.push(id);
    user_selection.traffic_days.push(day);
    selected_days += day;
    user_selection.traffic_fees.push(fee);
    selected_budget += fee;
    $("#myModal").modal("hide");
}

function addMapPoint(map, x, y) {
    let marker = new BMapGL.Marker(new BMapGL.Point(x, y));
    marker.id = x;
    let label = new BMapGL.Label(user_selection.city_list.length.toString(), {offset: new BMapGL.Size(12, -28)});
    label.setStyle({
        color: "#fff",
        backgroundColor: "#333333",
        border: "0",
        fontSize: "16px",
        opacity: "0.65",
        verticalAlign: "center",
        borderRadius: "5px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        padding: "5px 17px 5px 8px",
    });
    map.addOverlay(marker);
    marker.setLabel(label);
    map.centerAndZoom(new BMapGL.Point(x, y), 9);
}

function deleteMapOverlay(x, y) {
    let allOverlay = map.getOverlays();
    for (let i = 0; i < allOverlay.length; i++) {
        //删除指定id的Overlay
        if (allOverlay[i].id === x) {
            map.removeOverlay(allOverlay[i]);
            map.centerAndZoom(new BMapGL.Point(x, y), 9);
        }
    }
}

function addMapLine(map, x1, y1, x2, y2) {
    let polyline = new BMapGL.Polyline([
        new BMapGL.Point(x1, y1),
        new BMapGL.Point(x2, y2),
    ], {strokeColor: "red", strokeWeight: 4, strokeOpacity: 0.75});
    polyline.id = x1;
    map.addOverlay(polyline);
}

function alert(text) {
    $("body").append("<div class='alert alert-danger alert-heading'>\n" +
        "    <a href='#' class='close' data-dismiss='alert'><span>×</span></a>\n" +
        "    <h4 id=\"notice-title\">注意：</h4>\n" +
        "    <h6 id=\"notice-text\">" + text + "</h6>\n" +
        "</div>");
    $("div[class=alert-heading]:last").css("top", $("#routing-navbar").outerWidth(true));
}

function submit(user_selection) {
    let last_city_id = user_selection.city_list[user_selection.city_list.length - 1];
    let days_input = $("#" + last_city_id + "-days");
    let last_city_days = Number(days_input.val());
    if (user_selection.city_list.length === 0) {
        alert("请至少选择1个城市！");
        return;
    }
    if (Number(days_input.val()) === 0) {
        alert("请输入最后一个城市的天数！");
        return;
    }
    selected_days += last_city_days;
    user_selection.days.push(last_city_days);
    if (selected_days > user_days) {
        alert("您所选的第" + user_selection.city_list.length + "个城市天数超出预期天数！");
        selected_days -= user_selection.days.pop();
        if (isNaN(selected_days)) {
            selected_days = 0;
        }
        return;
    }
    data = {'cities': [], 'traffic': [], 'budget': selected_budget, 'days': selected_days};
    for (let x in user_selection.city_list) {
        for (let y in city_list) {
            if (city_list[y].city_id === user_selection.city_list[x]) {
                data.cities.push(city_list[y].city_name);
            }
        }
    }
    for (let x in user_selection.traffic) {
        for (let y in route_list) {
            if (route_list[y].route_id === user_selection.traffic[x]) {
                data.traffic.push(route_list[y].route_type);
            }
        }
    }
    let str = JSON.stringify(data);
    let btn = $("#continue");
    btn.val("LOADING...");
    btn.attr("disabled", "disabled");
    window.location.href = "/euroTrip/success?data=" + str;
}