from django.db import models
from django.contrib.auth.models import User

class TrafficIncident(models.Model):
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    location = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='LOW')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incidents')
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.location} - {self.severity}"


class VehicleDetection(models.Model):
    incident = models.ForeignKey(TrafficIncident, on_delete=models.CASCADE, related_name='detections', null=True, blank=True)
    vehicle_count = models.IntegerField(default=0)
    congestion_level = models.CharField(max_length=10, default='LOW')
    detected_at = models.DateTimeField(auto_now_add=True)
    video_source = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.vehicle_count} vehicles - {self.congestion_level}"