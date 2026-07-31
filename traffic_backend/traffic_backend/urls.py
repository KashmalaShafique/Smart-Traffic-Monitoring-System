from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from traffic.views import video_feed
from authentication.views import dashboard_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    path('api/traffic/', include('traffic.urls')),
    path('api/prediction/', include('prediction.urls')),
    path('api/nlp/', include('nlp.urls')),
    path('api/videoqa/', include('videoqa.urls')),
    path('video_feed/', video_feed),
    path('dashboard/', dashboard_view, name='dashboard'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
