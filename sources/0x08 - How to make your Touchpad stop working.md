# How to make your Touchpad stop working
Yesterday, a very unpleasant thing struck me. My touchpad has started to work
after I installed a batch of updates on my Arch Linux system. This proved
particularly annoying because it now behaves in an extremely obnoxious fashion:
the entire area of the touchpad gets mapped to the screen space, making it very
hard to control in a proper way. Heck, you could call it "The devil of pointer
devices" if my laptop didn't allow me to disable it using a hardware switch,
which in turn is weird, because most other functionality provided by the F-keys
had to be provided by my own scripts and bindings in my window manager (not my
own - yet).

This situation calls for a fix - ladies and gentlemen, I present to you:

## ~~Disabling~~ Breaking your touchpad completely
Well, not breaking. But making it dysfunctional would be a proper term.

The problem: I don't have a `synaptics` driver installed, so I don't know where
I have to search for configuration files to disable this "feature" we are
talking about.

Now, according to the
[arch wiki](https://wiki.archlinux.org/index.php/Xorg#Input_devices), the
offending component in the absence of `synaptics` is `evdev`, which has a
configuration file over at `/usr/share/X11/xorg.conf.d/10-evdev.conf`.
There are a few sections in that file, which follow a rather strange syntax
(vim tells me that it's a special syntax called `xf86conf`. I also found out
that we can comment stuff using `#`. Thanks, vim):
```
# Section "InputClass"
#         Identifier "evdev touchpad catchall"
#         MatchIsTouchpad "on"
#         MatchDevicePath "/dev/input/event*"
#         Driver "evdev"
# EndSection
```
So I commented out the section used to match on my touchpad. Let's hope this
works as planned.

Be right back, restarting X.
