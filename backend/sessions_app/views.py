from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q

from sessions_app.models import Session
from sessions_app.serializers import SessionSerializer
from sessions_app.permissions import IsCreator, IsOwnerOrReadOnly


class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer

    def get_queryset(self):
        return Session.objects.annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='active'))
        ).select_related('creator')

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsCreator()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsCreator])
def creator_sessions(request):
    """List creator's own sessions with booking counts."""
    sessions = Session.objects.filter(creator=request.user).annotate(
        booking_count=Count('bookings', filter=Q(bookings__status='active'))
    )
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)
