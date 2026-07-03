from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Experience, Profile, Project, TechStack
from .serializers import (
    ContactMessageSerializer,
    ExperienceSerializer,
    ProfileSerializer,
    ProjectSerializer,
    TechStackSerializer,
)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()


class TechStackListView(generics.ListAPIView):
    queryset = TechStack.objects.all()
    serializer_class = TechStackSerializer


class ExperienceListView(generics.ListAPIView):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ContactView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message sent!"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
