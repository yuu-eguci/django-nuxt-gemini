from django.urls import path

from . import views

urlpatterns = [
    # 関数ベース @api_view で実装した View。
    path('foo', views.foo_view),
    # クラスベース APIView で実装した View。
    path('bar', views.BarView.as_view()),
]
