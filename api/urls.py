from django.urls import path
from .views import OportunidadesList

urlpatterns = [
    path('oportunidades/', OportunidadesList.as_view(), name='oportunidades'),
]
