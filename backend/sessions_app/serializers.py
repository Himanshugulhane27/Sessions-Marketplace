from rest_framework import serializers
from sessions_app.models import Session
from accounts.serializers import UserSerializer


class SessionSerializer(serializers.ModelSerializer):
    creator_info = UserSerializer(source='creator', read_only=True)
    booking_count = serializers.IntegerField(read_only=True, required=False)
    spots_left = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'description', 'creator', 'creator_info',
            'price', 'datetime', 'capacity', 'image_url', 'created_at',
            'booking_count', 'spots_left',
        ]
        read_only_fields = ['id', 'creator', 'created_at']

    def get_spots_left(self, obj):
        count = getattr(obj, 'booking_count', None)
        if count is None:
            count = obj.bookings.filter(status='active').count()
        return obj.capacity - count
