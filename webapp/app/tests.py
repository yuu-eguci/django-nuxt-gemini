from django.test import SimpleTestCase


class FooViewTests(SimpleTestCase):

    def test_get_foo(self) -> None:
        # フロントエンド (pages/index.vue) が呼び出すパスです。
        response = self.client.get('/api/app/foo')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'This endpoint is GET foo.')
