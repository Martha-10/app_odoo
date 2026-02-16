from django.urls import path
from .views import OportunidadesList, OportunidadDetail

urlpatterns = [
    path('oportunidades/', OportunidadesList.as_view(), name='oportunidades'),
    path('oportunidades/<int:pk>/', OportunidadDetail.as_view(), name='oportunidad-detail'),
]
