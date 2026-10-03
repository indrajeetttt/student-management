from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Student
from .serializers import StudentSerializer


class LoginView(ObtainAuthToken):
    """
    POST username + password.
    Returns a token that must be sent as:
    Authorization: Token <token>
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        })


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        })


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("-id")
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
