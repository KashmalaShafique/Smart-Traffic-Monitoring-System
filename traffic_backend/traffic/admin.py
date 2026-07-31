from django.contrib import admin
from .models import TrafficIncident, VehicleDetection

admin.site.register(TrafficIncident)
admin.site.register(VehicleDetection)