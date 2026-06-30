from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from bookings.models import Booking
from bookings.serializers import BookingSerializer
from sessions_app.models import Session


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_booking(request):
    """Book a session for the current user."""
    session_id = request.data.get('session')
    if not session_id:
        return Response({'error': 'session is required'}, status=400)

    try:
        session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)

    # Check capacity
    active_count = session.bookings.filter(status='active').count()
    if active_count >= session.capacity:
        return Response({'error': 'Session is full'}, status=400)

    # Check duplicate
    if Booking.objects.filter(user=request.user, session=session, status='active').exists():
        return Response({'error': 'Already booked'}, status=400)

    booking = Booking.objects.create(user=request.user, session=session)
    serializer = BookingSerializer(booking)
    return Response(serializer.data, status=201)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_bookings(request):
    """List current user's bookings, filterable by status."""
    bookings = Booking.objects.filter(user=request.user).select_related('session', 'session__creator')

    status_filter = request.query_params.get('status')
    if status_filter == 'active':
        bookings = bookings.filter(status='active')
    elif status_filter == 'past':
        bookings = bookings.filter(
            status__in=['completed', 'cancelled']
        ) | bookings.filter(
            session__datetime__lt=timezone.now(),
            status='active'
        )

    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, pk):
    """Cancel a booking."""
    try:
        booking = Booking.objects.get(id=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)

    booking.status = 'cancelled'
    booking.save()
    return Response(BookingSerializer(booking).data)
