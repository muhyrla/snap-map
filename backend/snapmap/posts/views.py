from django.shortcuts import render
from django.http import JsonResponse
import json

# Create your views here.

def index(request):
    """Главная страница Telegram Mini App"""
    # Mock данные для демонстрации
    posts = [
        {
            'user': {'username': 'USERNAME'},
            'text': 'сфоткал манула нейросеть ебанулась',
            'image': None
        }
    ]
    
    context = {
        'posts': posts
    }
    
    return render(request, 'index.html', context)

def api_user_data(request):
    """API для получения данных пользователя"""
    if request.method == 'GET':
        # Здесь можно получить данные из Telegram WebApp
        user_data = {
            'username': 'USERNAME',
            'balance': '10.000$',
            'tasks_completed': 70,
            'daily_counter': 2
        }
        return JsonResponse(user_data)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
