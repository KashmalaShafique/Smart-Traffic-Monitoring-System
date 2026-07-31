from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {username}!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')

    return render(request, 'authentication/login.html')


def register_view(request):
    # Registration disabled — admin creates users via admin panel
    messages.error(request, 'Registration is restricted. Please contact the administrator.')
    return redirect('login')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'authentication/register.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken. Choose another.')
            return render(request, 'authentication/register.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return render(request, 'authentication/register.html')

        if len(password1) < 8:
            messages.error(request, 'Password must be at least 8 characters.')
            return render(request, 'authentication/register.html')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password1
        )
        user.save()
        messages.success(request, 'Account created successfully! Please login.')
        return redirect('login')

    return render(request, 'authentication/register.html')


def logout_view(request):
    logout(request)
    request.session.flush()
    messages.success(request, 'Logged out successfully.')
    response = redirect('login')
    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')
    return response


def forgot_password_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')

        if User.objects.filter(email=email).exists():
            messages.success(
                request,
                f'Password reset instructions sent to {email}. Check your inbox.'
            )
            return redirect('login')  # redirect to login after success
        else:
            messages.error(request, 'No account found with this email address.')

    return render(request, 'authentication/forgot_password.html')


@login_required
def dashboard_view(request):
    return render(request, 'authentication/dashboard.html')