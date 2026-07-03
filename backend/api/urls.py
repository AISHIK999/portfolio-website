from django.urls import path

from . import views

urlpatterns = [
    path("profile/", views.ProfileView.as_view()),
    path("tech-stack/", views.TechStackListView.as_view()),
    path("experience/", views.ExperienceListView.as_view()),
    path("projects/", views.ProjectListView.as_view()),
    path("contact/", views.ContactView.as_view()),
]
