from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sessions_app import views

router = DefaultRouter()
router.register(r'sessions', views.SessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
    path('creator/sessions/', views.creator_sessions, name='creator-sessions'),
]
