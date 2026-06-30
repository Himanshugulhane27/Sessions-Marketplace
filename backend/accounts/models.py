from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('creator', 'Creator'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    name = models.CharField(max_length=255, blank=True, default='')
    google_id = models.CharField(max_length=255, blank=True, unique=True, null=True)

    def __str__(self):
        return self.name or self.username
