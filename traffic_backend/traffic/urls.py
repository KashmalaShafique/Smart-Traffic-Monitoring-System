from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_traffic),
    path('incidents/', views.incident_list, name='incident_list'),
    path('incidents/create/', views.incident_create, name='incident_create'),
    path('incidents/<int:pk>/', views.incident_detail, name='incident_detail'),
    path('incidents/<int:pk>/update/', views.incident_update, name='incident_update'),
    path('incidents/<int:pk>/delete/', views.incident_delete, name='incident_delete'),
]