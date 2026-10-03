from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CurrentUserView, LoginView, StudentViewSet

router = DefaultRouter()
router.register("students", StudentViewSet)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
]

urlpatterns += router.urls
