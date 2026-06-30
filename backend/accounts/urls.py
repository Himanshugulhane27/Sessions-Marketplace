from django.urls import path
from accounts import views

urlpatterns = [
    path('auth/google/', views.google_auth, name='google-auth'),
    path('auth/become-creator/', views.become_creator, name='become-creator'),
    path('profile/', views.profile, name='profile'),
]
