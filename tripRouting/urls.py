from django.contrib import admin
from django.urls import path
from . import views


app_name = 'tripRouting'
urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('regist/', views.regist, name='regist'),
    path('routing/', views.routing, name='routing'),
    path('routing_ajax_init/', views.routing_ajax_init, name='routing_ajax_init'),
]
