import unittest
from unittest.mock import patch
import portable_input as api


@unittest.skipUnless(api._wayland, 'Hyprland translation tests')
class TranslationTests(unittest.TestCase):
    @patch.object(api, '_run')
    def test_shift_release_order(self, run):
        api.press('!')
        self.assertEqual(run.call_args_list[0].args[-2:], ('42:1', '2:1'))
        self.assertEqual(run.call_args_list[1].args[-2:], ('2:0', '42:0'))

    @patch.object(api, '_run')
    def test_negative_horizontal_scroll(self, run):
        api.hscroll(-3)
        self.assertEqual(run.call_args.args, ('ydotool', 'mousemove', '--wheel', '-x', '-3'))

    @patch.object(api, '_run')
    def test_invalid_key_does_not_send_input(self, run):
        with self.assertRaises(ValueError):
            api.press('not-a-key')
        run.assert_not_called()

    @patch.object(api, 'mouseUp')
    @patch.object(api, 'moveTo', side_effect=RuntimeError('failure'))
    @patch.object(api, 'mouseDown')
    def test_drag_releases_on_failure(self, down, move, up):
        with self.assertRaises(RuntimeError):
            api.dragTo(20, 30)
        up.assert_called_once_with(button='left')


if __name__ == '__main__':
    unittest.main()
