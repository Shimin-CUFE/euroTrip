$(document).ready(function () {
    map = new BMapGL.Map("container");
    // 创建地图实例
    var initPoint = new BMapGL.Point(7.718548, 50.067641);
    // 创建点坐标
    map.centerAndZoom(initPoint, 6);
    // 初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom();


    $.ajax({
        type: "GET",
        url: "/euroTrip/routing_ajax_init",
        success: function (jsonData) {
            $("#json-show").get(0).innerHTML = jsonData.toString();
            var data = JSON.parse(jsonData);
            cities = JSON.parse(data.city);
            // routes = JSON.parse(data.route)
            var cityArea = document.getElementsByClassName("city-area")[0];
            //Show city list
            for (x in cities) {
                var city = JSON.parse(cities[x]);
                var button = document.createElement("input");
                button.setAttribute("type", "button");
                button.setAttribute("value", city.city_name);
                button.setAttribute("id", city.city_id);
                button.setAttribute("class", "city-button");
                var onclick_fn = "addMapPoint(map, " + city.city_x + ", " + city.city_y + ");";
                button.setAttribute("onclick", onclick_fn);
                cityArea.appendChild(button);
                cityArea.appendChild(document.createElement("br"));
            }
        }
    });
    $("#trip-days").bind("input propertychange", update_constraint);
    $("#trip-budget").bind("input propertychange", update_constraint);


});

function update_constraint() {
    var days = $("#trip-days");
    var budget = $("#trip-budget");
    $("#days-info").val(days.val());
    $("#budget-info").val(budget.val());
    if (budget.val() !== "" && days.val() !== "") {
        $("#main-function").removeAttr("hidden");
    }
}

function newRoute(city_id_1, city_id_2) {

}

function addMapPoint(map, x, y) {
    map.centerAndZoom(new BMapGL.Point(x, y), 10);
    map.addOverlay(new BMapGL.Marker(new BMapGL.Point(x, y)));
}

function addMapLine(map, x1, y1, x2, y2) {
    var polyline = new BMapGL.Polyline([
        new BMapGL.Point(x1, y1),
        new BMapGL.Point(x2, y2),
    ], {strokeColor: "red", strokeWeight: 2, strokeOpacity: 0.5});
    map.addOverlay(polyline)
}

