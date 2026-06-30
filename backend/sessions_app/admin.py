from django.contrib import admin
from sessions_app.models import Session

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'price', 'datetime', 'capacity']
