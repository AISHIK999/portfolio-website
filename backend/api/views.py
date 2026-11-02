from django.db import connection
from django.utils.cache import patch_cache_control
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


class PublicCacheMixin(APIView):
    """Cache successful read responses at the CDN edge.

    Vercel only caches function responses when they are sent with `s-maxage`.
    A short `s-maxage` keeps content edits reasonably fresh while letting the
    vast majority of visitors hit the edge cache instead of the Lambda + DB.
    """

    cache_seconds = 300

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method in ("GET", "HEAD") and response.status_code == 200:
            patch_cache_control(
                response,
                public=True,
                max_age=60,
                s_maxage=self.cache_seconds,
                stale_while_revalidate=86400,
            )
        return response


class ProfileView(PublicCacheMixin, generics.RetrieveAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return Profile.objects.first()  # type: ignore[attr-defined]


class TechStackListView(PublicCacheMixin, generics.ListAPIView):
    queryset = TechStack.objects.all()  # type: ignore[attr-defined]
    serializer_class = TechStackSerializer


class ExperienceListView(PublicCacheMixin, generics.ListAPIView):
    queryset = Experience.objects.all()  # type: ignore[attr-defined]
    serializer_class = ExperienceSerializer


class ProjectListView(PublicCacheMixin, generics.ListAPIView):
    queryset = Project.objects.all()  # type: ignore[attr-defined]
    serializer_class = ProjectSerializer


class BootstrapView(PublicCacheMixin, APIView):
    """Return every portfolio resource in a single request.

    Useful for clients that genuinely need all resources at once: one cold
    start and one database connection instead of four.
    """

    def get(self, request):
        profile = Profile.objects.first()  # type: ignore[attr-defined]
        return Response(
            {
                "profile": (
                    ProfileSerializer(profile).data if profile else None
                ),
                "tech_stack": TechStackSerializer(
                    TechStack.objects.all(),  # type: ignore[attr-defined]
                    many=True,
                ).data,
                "experience": ExperienceSerializer(
                    Experience.objects.all(),  # type: ignore[attr-defined]
                    many=True,
                ).data,
                "projects": ProjectSerializer(
                    Project.objects.all(),  # type: ignore[attr-defined]
                    many=True,
                ).data,
            }
        )


class HealthView(APIView):
    """Touches the database so a keep-warm ping also keeps Neon awake."""

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return Response({"status": "ok"})


class ContactView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message sent!"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
