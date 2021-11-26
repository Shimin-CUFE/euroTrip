var map = new BMapGL.Map("container");
// 创建地图实例
var point = new BMapGL.Point(116.404, 39.915);
// 创建点坐标
map.centerAndZoom(point, 15);
// 初始化地图，设置中心点坐标和地图级别