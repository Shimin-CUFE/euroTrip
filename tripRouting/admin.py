from django.contrib import admin
from . import models


class RouteAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['route_id', 'route_city1', 'route_city2']}),
        ('Route information', {'fields': ['route_distance', 'route_type', 'route_start', 'route_finish', 'route_fee']}),
    ]
    list_display = ['route_id', 'route_city1', 'route_city2', 'route_type']


class CityAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['city_id', 'city_name']}),
        ('City information', {'fields': ['city_price', 'city_url', 'city_x', 'city_y']}),
    ]
    list_display = ['city_id', 'city_name']


admin.site.register(models.City, CityAdmin)
admin.site.register(models.Route, RouteAdmin)
