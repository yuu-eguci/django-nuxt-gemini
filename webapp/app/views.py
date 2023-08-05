import logging
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class FooView(APIView):
    def get(self, request):
        logger.info("foo")
        return Response({"message": "foo"})
