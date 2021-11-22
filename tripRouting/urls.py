from django.contrib import admin
from django.urls import path
from . import views


app_name = 'tripRouting'
urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('regist/', views.regist, name='regist'),
    path('routing/', views.routing, name='routing'),
]
