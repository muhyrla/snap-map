from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/user-data/', views.api_user_data, name='api_user_data'),
]
