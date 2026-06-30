from django.urls import path
from bookings import views

urlpatterns = [
    path('bookings/', views.create_booking, name='create-booking'),
    path('bookings/list/', views.list_bookings, name='list-bookings'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='cancel-booking'),
]
