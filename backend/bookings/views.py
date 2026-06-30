from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    """Create a Stripe Checkout Session for a booking."""
    session_id = request.data.get('session')
    if not session_id:
        return Response({'error': 'session is required'}, status=400)

    try:
        db_session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)

    # Basic checks
    active_count = db_session.bookings.filter(status='active').count()
    if active_count >= db_session.capacity:
        return Response({'error': 'Session is full'}, status=400)

    if Booking.objects.filter(user=request.user, session=db_session, status='active').exists():
        return Response({'error': 'Already booked'}, status=400)

    # Create Stripe Checkout Session
    # Frontend URL base
    frontend_url = 'http://localhost'

    try:
        # Convert price to cents
        unit_amount = int(float(db_session.price) * 100)
        
        # If price is 0, we could just create the booking directly, but for demo let's assume
        # all flow goes through Stripe or bypasses it. Actually, if price is 0, let's just bypass Stripe
        # and create booking.
        if unit_amount == 0:
            booking = Booking.objects.create(
                user=request.user, 
                session=db_session,
                payment_status='paid'
            )
            return Response({'url': f"{frontend_url}/booking/success?session_id=free"})

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': db_session.title,
                        },
                        'unit_amount': unit_amount,
                    },
                    'quantity': 1,
                }
            ],
            mode='payment',
            success_url=frontend_url + '/booking/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=frontend_url + '/booking/cancel',
            client_reference_id=str(request.user.id),
            metadata={
                'session_id': str(db_session.id)
            }
        )
        return Response({'url': checkout_session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def confirm_payment(request):
    """Confirm payment via Stripe session ID and create the Booking record.
    NOTE: In production, this logic should be in a webhook handler for `checkout.session.completed` 
    to be robust against users closing the browser before redirect.
    """
    stripe_session_id = request.query_params.get('session_id')
    
    if not stripe_session_id:
        return Response({'error': 'session_id is required'}, status=400)
        
    if stripe_session_id == 'free':
        return Response({'status': 'success'})

    try:
        checkout_session = stripe.checkout.Session.retrieve(stripe_session_id)
        
        if checkout_session.payment_status == 'paid':
            # Create booking
            user_id = checkout_session.client_reference_id
            db_session_id = checkout_session.metadata.get('session_id')
            
            db_session = Session.objects.get(id=db_session_id)
            
            # Avoid duplicate creation
            booking, created = Booking.objects.get_or_create(
                user_id=user_id,
                session=db_session,
                defaults={
                    'payment_status': 'paid',
                    'stripe_session_id': stripe_session_id
                }
            )
            
            if not created and booking.payment_status != 'paid':
                booking.payment_status = 'paid'
                booking.stripe_session_id = stripe_session_id
                booking.save()
                
            return Response({'status': 'success'})
        else:
            return Response({'error': 'Payment not successful'}, status=400)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)
