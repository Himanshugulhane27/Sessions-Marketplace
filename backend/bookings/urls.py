from django.urls import path
from bookings import views

urlpatterns = [
    path('bookings/', views.create_booking, name='create-booking'),
    path('bookings/checkout/', views.create_checkout_session, name='create-checkout'),
    path('bookings/confirm/', views.confirm_payment, name='confirm-payment'),
    path('bookings/list/', views.list_bookings, name='list-bookings'),
    path('bookings/<int:pk>/cancel/', views.cancel_booking, name='cancel-booking'),
]
