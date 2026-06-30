import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from accounts.models import User
from accounts.serializers import UserSerializer, ProfileUpdateSerializer
from accounts.authentication import generate_jwt


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Accept a Google id_token or authorization code,
    verify it, create/get user, return JWT.
    """
    credential = request.data.get('credential') or request.data.get('id_token')
    code = request.data.get('code')

    if credential:
        # Verify the id_token directly
        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=400)
    elif code:
        # Exchange authorization code for tokens
        try:
            token_response = requests.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': request.data.get('redirect_uri', 'http://localhost:3000'),
                    'grant_type': 'authorization_code',
                },
            )
            token_data = token_response.json()
            if 'error' in token_data:
                return Response({'error': token_data['error']}, status=400)

            idinfo = id_token.verify_oauth2_token(
                token_data['id_token'],
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except Exception as e:
            return Response({'error': f'Auth code exchange failed: {str(e)}'}, status=400)
    else:
        return Response({'error': 'No credential or code provided'}, status=400)

    # Extract user info
    google_id = idinfo.get('sub')
    email = idinfo.get('email', '')
    name = idinfo.get('name', '')
    avatar_url = idinfo.get('picture', '')

    # Create or get user
    user, created = User.objects.get_or_create(
        google_id=google_id,
        defaults={
            'username': email.split('@')[0] + '_' + google_id[:6],
            'email': email,
            'name': name,
            'avatar_url': avatar_url,
        },
    )
    if not created:
        # Update avatar on each login
        user.avatar_url = avatar_url
        if not user.name:
            user.name = name
        user.save()

    # Generate JWT
    token = generate_jwt(user)

    return Response({
        'token': token,
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_creator(request):
    """Switch user role to creator."""
    user = request.user
    user.role = 'creator'
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get or update current user's profile."""
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(request.user).data)
