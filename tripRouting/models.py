# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
import json


class City(models.Model):
    city_id = models.IntegerField(primary_key=True)
    city_name = models.CharField(max_length=20)
    city_price = models.IntegerField()
    city_url = models.CharField(max_length=40)
    city_x = models.FloatField()
    city_y = models.FloatField()

    def to_json(self):
        city_dict = {
            'city_id': self.city_id,
            'city_name': self.city_name,
            'city_price': self.city_price,
            'city_url': self.city_url,
            'city_x': self.city_x,
            'city_y': self.city_y,
        }
        return json.dumps(city_dict, ensure_ascii=False).encode('utf-8').decode()

    class Meta:
        managed = False
        db_table = 'city'


class Route(models.Model):
    route_id = models.IntegerField(primary_key=True)
    route_city1 = models.ForeignKey(City, models.DO_NOTHING, db_column='route_city1', related_name='route_city1')
    route_city2 = models.ForeignKey(City, models.DO_NOTHING, db_column='route_city2', related_name='route_city2')
    route_distance = models.IntegerField()
    route_type = models.CharField(max_length=20)
    route_start = models.IntegerField()
    route_finish = models.IntegerField()
    route_fee = models.IntegerField()

    def to_json(self):
        route_dict = {
            'route_id': self.route_id,
            'route_city1': self.route_city1.city_id,
            'route_city2': self.route_city2.city_id,
            'route_distance': self.route_distance,
            'route_type': self.route_type,
            'route_start': self.route_start,
            'route_finish': self.route_finish,
            'route_fee': self.route_fee,
        }
        return json.dumps(route_dict, ensure_ascii=False).encode('utf-8').decode()

    class Meta:
        managed = False
        db_table = 'route'


class Scenery(models.Model):
    scenery_id = models.IntegerField(primary_key=True)
    scenery_city = models.ForeignKey(City, models.DO_NOTHING, db_column='scenery_city')
    scenery_name = models.CharField(max_length=20)
    scenery_url = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'scenery'


class User(models.Model):
    user_id = models.IntegerField(primary_key=True)
    user_name = models.CharField(max_length=20)
    user_pwd = models.CharField(max_length=40)

    class Meta:
        managed = True
        db_table = 'user'
