from django.db import models
from django.conf import settings


class Session(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions',
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    datetime = models.DateTimeField()
    capacity = models.PositiveIntegerField(default=10)
    image_url = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-datetime']

    def __str__(self):
        return self.title
