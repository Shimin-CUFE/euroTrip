selected_days = 0;
selected_budget = 0;
user_days = 0;
user_budget = 0;
city_list = [];
route_list = [];

$(document).ready(function () {
    //Load Baidu Map
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
                //城市按钮 TODO: 用jQuery重构
                var button1 = document.createElement("input");
                button1.setAttribute("type", "button");
                button1.setAttribute("value", city.city_name);
                button1.setAttribute("id", city.city_id);
                button1.setAttribute("class", "city-button");
                var onclick_fn = "appendCity(" + city.city_id + ", " + city.city_x + ", " + city.city_y + ");";
                button1.setAttribute("onclick", onclick_fn);
                city_area.appendChild(button1);
                //City days input
                var day = document.createElement("input");
                day.setAttribute("type", "number");
                day.setAttribute("id", city.city_id + "-days");
                day.setAttribute("class", "city-days-input");
                city_area.appendChild(day);
                //每个城市分行显示
                city_area.appendChild(document.createElement("br"));
                city_area.appendChild(document.createElement("br"));
                city_area.appendChild(document.createElement("br"));
            }
            for (x in routes) {
                //路径按钮 TODO: 用jQuery重构
                var route = JSON.parse(routes[x])
                route_list.push(route);
                var button2 = document.createElement("input");
                button2.setAttribute("type", "button");
                button2.setAttribute("value", route.route_type);
                button2.setAttribute("id", route.route_id);
                button2.setAttribute("class", "route-button");
                var start_city = route.route_city1;
                button2.setAttribute("start-city", start_city)
                // var onclick_fn = "appendCity(" + city.city_id + ", " + city.city_x + ", " + city.city_y + ");";
                // button.setAttribute("onclick", onclick_fn);
                city_area.insertBefore(button2, document.getElementById(start_city).nextSibling.nextSibling.nextSibling);
            }
        }
    });
    $("#trip-days").bind("input propertychange", updateConstraint);
    $("#trip-budget").bind("input propertychange", updateConstraint);
    user_selection = {'city_list': [], 'traffic': [-1], 'days': []};
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
    // TODO: add days and budgets restricts
    // 1. 点击路径控制：按钮disable属性
    // 2. 限制条件控制：所有按钮disable
    if (user_selection.city_list.includes(city_id)) {
        if (user_selection.city_list[user_selection.city_list.length - 1] === city_id) {
            // 删除最后一个城市
            deleteMapOverlay(city_x, city_y);
            user_selection.city_list.pop();
            for (x in city_list) {
                if (city_list[x].city_id === city_id) {
                    selected_budget -= city_list[x].city_price;
                    selected_days -= user_selection.days.pop();
                }
            }
            $("#" + user_selection.city_list[user_selection.city_list.length - 1] + "-days").removeAttr("disabled");
        } else {
            alert("You've already chosen!");
        }
    } else {
        //检查budget限制
        for (x in city_list) {
            if (city_list[x].city_id === city_id) {
                selected_budget += city_list[x].city_price;
                if (selected_budget > user_budget) {
                    alert("Out of budget!");
                    selected_budget -= city_list[x].city_price;
                    return;
                }
            }
        }
        if (user_selection.city_list.length > 0) {
            var last_city_id = user_selection.city_list[user_selection.city_list.length - 1];
            //检查days限制 TODO: DEBUG days值不正确
            var days_input = $("#" + last_city_id + "-days");
            var last_city_days = Number(days_input.val());
            if (last_city_days === 0) {
                alert("Please input city days");
                return;
            }
            selected_days += last_city_days;
            user_selection.days.push(last_city_days);
            if (selected_days > user_days) {
                alert("City: " + user_selection.city_list.length + " out of days!");
                selected_days -= last_city_days;
                return;
            }
            days_input.attr("disabled", "disabled");
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

function addMapPoint(map, x, y) {
    var marker = new BMapGL.Marker(new BMapGL.Point(x, y));
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
    map.centerAndZoom(new BMapGL.Point(x, y), 8);
}

function deleteMapOverlay(x, y) {
    var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++) {
        //删除指定id的Overlay
        if (allOverlay[i].id === x) {
            map.removeOverlay(allOverlay[i]);
            map.centerAndZoom(new BMapGL.Point(x, y), 8);
        }
    }
}

function addMapLine(map, x1, y1, x2, y2) {
    var polyline = new BMapGL.Polyline([
        new BMapGL.Point(x1, y1),
        new BMapGL.Point(x2, y2),
    ], {strokeColor: "red", strokeWeight: 4, strokeOpacity: 0.75});
    polyline.id = x1;
    map.addOverlay(polyline);
}

