import logging
from django.http import JsonResponse, HttpRequest
from rest_framework.decorators import api_view
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


@api_view(['GET', 'POST'])
def foo_view(request: HttpRequest):
    """
    View を関数ベースで実装するパターン。
    - ひとつのエンドポイントに対して、ひとつの HTTP メソッドを定義するんだったら一番シンプルなんじゃない?
    - でもこのように↓複数 HTTP メソッドが欲しいなら分岐ができちゃう。クラスベースのほうがいいんじゃない?

    urls では:
    path('foo', views.foo_view)
    """

    if request.method == 'GET':
        return JsonResponse({"message": "This endpoint is GET foo."})
    elif request.method == 'POST':
        return JsonResponse({"message": "This endpoint is POST foo."})


class BarView(APIView):
    """
    というわけで View をクラスベースで実装するパターン。
    - ちょっと複雑になるけど、ひとつのエンドポイントに対して、複数 HTTP メソッドを定義できる。

    urls では:
    path('bar', views.BarView.as_view())

    まとめ:
    - "関数ベースの @api_view とクラスベースの APIView はどう違う?"
        - 自分なりの回答: ひとつのエンドポイントに対して、複数 HTTP メソッドを定義するときのキレイさが違うよ。
    """

    def get(self, request, *args, **kwargs):
        # NOTE: utils.exception_handlers.custom_exception_handler を試すためにわざと例外を発生させているよ。
        raise NotImplementedError(
            "To test custom_exception_handler, this endpoint raises NotImplementedError intentionally.")
        return JsonResponse({"message": "This endpoint is GET bar."})

    def post(self, request, *args, **kwargs):
        return JsonResponse({"message": "This endpoint is POST bar."})
