import jwt
import datetime
from django.conf import settings
from rest_framework import authentication, exceptions
from accounts.models import User


class JWTAuthentication(authentication.BaseAuthentication):
    """Custom JWT authentication for DRF."""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)


def generate_jwt(user):
    """Generate a JWT token for a user."""
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            hours=settings.JWT_EXPIRATION_HOURS
        ),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token
