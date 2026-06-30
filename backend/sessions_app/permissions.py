from rest_framework import permissions


class IsCreator(permissions.BasePermission):
    """Only allow users with role='creator'."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'creator'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, everyone else read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user
