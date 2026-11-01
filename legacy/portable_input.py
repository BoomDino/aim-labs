"""Desktop input adapter: Windows/X11 via PyAutoGUI; Hyprland via ydotool."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

LEFT, MIDDLE, RIGHT = 'left', 'middle', 'right'
_wayland = sys.platform.startswith('linux') and bool(os.environ.get('WAYLAND_DISPLAY'))


def _run(*args):
    try:
        return subprocess.run(args, check=True, capture_output=True, text=True, timeout=5).stdout.strip()
    except (OSError, subprocess.SubprocessError) as exc:
        raise RuntimeError(f'Input backend failed ({args[0]}): {exc}') from exc


if _wayland:
    if not os.environ.get('HYPRLAND_INSTANCE_SIGNATURE'):
        raise RuntimeError('This Wayland backend requires Hyprland.')
    _codes = dict(re.findall(r'^#define KEY_(\w+)\s+(\d+)\s*$', Path('/usr/include/linux/input-event-codes.h').read_text(), re.M))
    _aliases = {'ctrl': 'LEFTCTRL', 'ctrlleft': 'LEFTCTRL', 'ctrlright': 'RIGHTCTRL',
                'shift': 'LEFTSHIFT', 'shiftleft': 'LEFTSHIFT', 'shiftright': 'RIGHTSHIFT',
                'alt': 'LEFTALT', 'altleft': 'LEFTALT', 'altright': 'RIGHTALT',
                'command': 'LEFTMETA', 'win': 'LEFTMETA', 'option': 'LEFTALT',
                'return': 'ENTER', '\n': 'ENTER', '\r': 'ENTER', '\t': 'TAB',
                ' ': 'SPACE', 'escape': 'ESC', 'pgup': 'PAGEUP', 'pgdn': 'PAGEDOWN',
                'del': 'DELETE', 'volumemute': 'MUTE', 'volumeup': 'VOLUMEUP', 'volumedown': 'VOLUMEDOWN'}
    _plain = "`1234567890-=[]\\;',./"
    _names = 'GRAVE 1 2 3 4 5 6 7 8 9 0 MINUS EQUAL LEFTBRACE RIGHTBRACE BACKSLASH SEMICOLON APOSTROPHE COMMA DOT SLASH'.split()
    _aliases.update(zip(_plain, _names))
    _shifted = dict(zip('~!@#$%^&*()_+{}|:"<>?', _plain))
else:
    try:
        import pyautogui as _gui
    except ImportError as exc:
        raise RuntimeError('Install dependencies: python -m pip install -r requirements.txt') from exc


def _key_event(key, down):
    if not _wayland:
        return (_gui.keyDown if down else _gui.keyUp)(key)
    shifted = key in _shifted or (len(key) == 1 and key.isupper())
    base = _shifted.get(key, key.lower())
    code = _codes.get(_aliases.get(base, base.upper()))
    if code is None:
        raise ValueError(f'Unsupported key: {key!r}')
    events = [f'{code}:{int(down)}']
    if shifted:
        events = ['42:1'] + events if down else events + ['42:0']
    _run('ydotool', 'key', '--key-delay', '0', *events)


def keyDown(key):
    _key_event(key, True)


def keyUp(key):
    _key_event(key, False)


def press(key):
    keyDown(key)
    keyUp(key)


def position():
    if not _wayland:
        return tuple(_gui.position())
    data = json.loads(_run('hyprctl', '-j', 'cursorpos'))
    return data['x'], data['y']


def size():
    """Primary/focused monitor size; Hyprland uses logical coordinates."""
    if not _wayland:
        return tuple(_gui.size())
    monitors = json.loads(_run('hyprctl', '-j', 'monitors'))
    m = next((m for m in monitors if m.get('focused')), monitors[0])
    w, h = m['width'], m['height']
    if m.get('transform', 0) % 2:
        w, h = h, w
    return round(w / m['scale']), round(h / m['scale'])


def moveTo(x=None, y=None):
    if x is None or y is None:
        old_x, old_y = position()
        x, y = old_x if x is None else x, old_y if y is None else y
    if _wayland:
        _run('hyprctl', 'dispatch', 'movecursor', str(int(x)), str(int(y)))
    else:
        _gui.moveTo(x, y)


def _button(button, mask):
    codes = {LEFT: 0, RIGHT: 1, MIDDLE: 2}
    if button not in codes:
        raise ValueError(f'Unsupported button: {button}')
    _run('ydotool', 'click', hex(mask | codes[button]))


def mouseDown(x=None, y=None, button=LEFT):
    if x is not None or y is not None:
        moveTo(x, y)
    if _wayland:
        _button(button, 0x40)
    else:
        _gui.mouseDown(button=button)


def mouseUp(x=None, y=None, button=LEFT):
    if x is not None or y is not None:
        moveTo(x, y)
    if _wayland:
        _button(button, 0x80)
    else:
        _gui.mouseUp(button=button)


def click(x=None, y=None, button=LEFT, clicks=1, interval=0.0):
    if clicks < 0 or interval < 0:
        raise ValueError('clicks and interval must be nonnegative')
    for i in range(clicks):
        if i:
            time.sleep(interval)
        mouseDown(x, y, button)
        mouseUp(button=button)


def scroll(clicks, x=None, y=None, horizontal=False):
    if x is not None or y is not None:
        moveTo(x, y)
    if _wayland:
        _run('ydotool', 'mousemove', '--wheel', '-x' if horizontal else '-y', str(int(clicks)))
    else:
        (_gui.hscroll if horizontal else _gui.scroll)(int(clicks))


def hscroll(clicks, x=None, y=None):
    scroll(clicks, x, y, horizontal=True)


def dragTo(x, y, button=LEFT):
    mouseDown(button=button)
    try:
        moveTo(x, y)
    finally:
        mouseUp(button=button)


# Compatibility with callers of the pasted module's private API.
_keyDown, _keyUp = keyDown, keyUp
_position, _size, _moveTo = position, size, moveTo
_mouseDown, _mouseUp, _click = mouseDown, mouseUp, click
_scroll, _vscroll, _hscroll = scroll, scroll, hscroll

def _dragTo(x, y, button):
    # Original low-level API assumes the button is already held.
    moveTo(x, y)


def _multiClick(x, y, button, num, interval=0.0):
    click(x, y, button, num, interval)


def _mouse_is_swapped():
    if _wayland:
        raise NotImplementedError('Mouse button swap detection is unavailable on Hyprland')
    return _gui.platformModule._mouse_is_swapped()


if __name__ == '__main__':
    print(json.dumps({'backend': 'Hyprland/ydotool' if _wayland else 'PyAutoGUI',
                      'position': position(), 'size': size()}, indent=2))
