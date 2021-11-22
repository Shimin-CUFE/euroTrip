from django import forms
from django.shortcuts import render, redirect

from .models import User


class UserForm(forms.Form):
    username = forms.CharField(label='username', max_length=50)
    password = forms.CharField(label='pwd', widget=forms.PasswordInput)


def index(request):
    """Load index page"""
    islogin = request.session.get('islogin', None)
    username = request.session.get('username', None)
    if islogin == 1:
        return render(request, 'tripRouting/index.html', {'islogin': True, 'username': username})
    return render(request, 'tripRouting/index.html', {'islogin': False})


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
                request.session['islogin'] = 1
                request.session.set_expiry(30)
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
    """Load regist page"""
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
    return render(request, 'tripRouting/routing.html')
