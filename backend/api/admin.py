from django.contrib import admin

from .models import ContactMessage, Experience, Profile, Project, TechStack

admin.site.register(Profile)
admin.site.register(TechStack)
admin.site.register(Experience)
admin.site.register(Project)
admin.site.register(ContactMessage)
