from django.db import models


class Profile(models.Model):
    name = models.CharField(max_length=100)
    tagline = models.TextField()
    roles = models.JSONField(default=list)
    bio = models.TextField()
    avatar = models.URLField(max_length=500, blank=True)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    email = models.EmailField()
    resume = models.URLField(max_length=500, blank=True)


class TechStack(models.Model):
    node = models.URLField(blank=True)
    title = models.CharField(max_length=100)
    href = models.URLField(blank=True)


class Experience(models.Model):
    company = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # null = present
    description = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["-order"]

    def __str__(self):
        return f"{self.role} @ {self.company}"


class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    tech_stack = models.JSONField(default=list)  # e.g. ["Vue", "Django"]
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    image = models.URLField(max_length=500, blank=True)
    featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["-order"]

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.name}"
