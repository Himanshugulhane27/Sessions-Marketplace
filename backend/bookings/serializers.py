from rest_framework import serializers
from bookings.models import Booking
from sessions_app.serializers import SessionSerializer


class BookingSerializer(serializers.ModelSerializer):
    session_info = SessionSerializer(source='session', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'session', 'session_info', 'status', 'booked_at']
        read_only_fields = ['id', 'user', 'status', 'booked_at']
