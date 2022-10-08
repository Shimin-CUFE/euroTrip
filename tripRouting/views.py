import json

from django import forms
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from .models import User, City, Route


class UserForm(forms.Form):
    username = forms.CharField(label='username', max_length=50)
    password = forms.CharField(label='password', widget=forms.PasswordInput)


def index(request):
    """Load index page"""
    status = request.session.get('status', None)
    username = request.session.get('username', None)

    city_list = City.objects.all()

    if status == 1:
        return render(request, 'tripRouting/index.html',
                      {'islogin': True, 'username': username, 'city_list': city_list})
    return render(request, 'tripRouting/index.html', {'islogin': False, 'city_list': city_list})


def login(request):
    """Load login page"""
    if request.method == 'POST':
        userform = UserForm(request.POST)
        if userform.is_valid():
            username = userform.cleaned_data['username']
            password = userform.cleaned_data['password']
            user = User.objects.filter(user_name__exact=username, user_pwd__exact=password)
            if user:
                request.session['username'] = username
                request.session['status'] = 1
                request.session.set_expiry(0)
                return redirect('tripRouting:index')
            else:
                return render(request, 'tripRouting/login.html', {'userform': userform, 'msg': 'Invalid Login!'})
    else:
        userform = UserForm()
    return render(request, 'tripRouting/login.html', {'userform': userform, 'msg': None})


def logout(request):
    request.session.flush()
    return redirect('tripRouting:index')


def regist(request):
    if request.method == 'POST':
        userform = UserForm(request.POST)
        if userform.is_valid():
            username = userform.cleaned_data['username']
            password = userform.cleaned_data['password']
            userid = User.objects.latest('user_id').user_id + 1
            newuser = User(user_id=userid, user_name=username, user_pwd=password)
            newuser.save()
            return redirect('tripRouting:login')
    else:
        userform = UserForm()
    return render(request, 'tripRouting/regist.html', {'userform': userform})


def routing(request):
    status = request.session.get('status', None)
    if status != 1:
        return redirect('tripRouting:login')
    # Safety return
    return render(request, 'tripRouting/routing.html')


def routing_ajax_init(request):
    city_list = City.objects.all()
    route_list = Route.objects.all()
    cities = {}
    counter = 0
    for city in city_list:
        cities[counter] = str(city.to_json())
        counter += 1
    routes = {}
    counter = 0
    for route in route_list:
        routes[counter] = str(route.to_json())
        counter += 1
    return JsonResponse(json.dumps({'city': (json.dumps(cities, ensure_ascii=False).encode('utf-8').decode()),
                                    'route': json.dumps(routes, ensure_ascii=False).encode('utf-8').decode()},
                                   ensure_ascii=False).encode('utf-8').decode(), safe=False)


@csrf_exempt
def success(request):
    if request.method == 'POST':
        return render(request, 'tripRouting/success.html')
    else:
        context = json.loads(str(request.GET['data']))
        return render(request, 'tripRouting/success.html', context=context)
