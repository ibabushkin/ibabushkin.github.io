# Non-reparenting Window Managers and Firefox
As I mentioned in the previous
[article](https://ibabushkin.github.io/0x0E%20-%20A%20Guide%20to%20gabelstaplerwm%20and%20an%20Overview%20of%20Current%20Bugs),
`gabelstaplerwm` exposes particularly weird behaviour in Firefox' UI.  This, to
put it mildly, sucks, so I started investigating this issue which manifests
itself exposing the following properties:

* extreme UI lag when running `gabelstaplerwm` or `dwm` as a window manager,
  however no trace of this behaviour when running inside `Xephyr`.
* firefox is the only application affected.
* `awesomewm` isn't affected on my hardware, others have confirmed the bug
  when running `dwm`.

Now, when we collect all this information, one thing becomes apparent: Neither
`dwm` nor `gabelstaplerwm` are so-called *reparenting window managers*, but
`awesomewm` and most other modern window managers are.

## But what does it mean? And why should firefox care?
A *reparenting window manager* is making use of a functionality of the X
protocol that allows to change the parent of a particular window (which itself
is a window).  That bit is pretty obvious given the name. But why would one
want to do that? The most common use-case for window managers is drawing window
decoration around the windows belonging to individual clients. This includes
titlebars, buttons...

When we avoid reparenting, realizing features like this becomes really
cumbersome.  You have to keep track of a window's size and create, draw and
maintain the state of a sibling window that would contain all the decoration.
Besides, if said bells and whistles are of a more complex shape or located on
multiple sides of the window, this becomes more complicated than you could ever
hope it to be.

The alternative is to create a toplevel window and reparent the client's window
to it, making it it's child and only ever need to handle relative size and
position.

That said, reparenting is also done on a different level, the EWMH standard
requires it to be done with a toplevel child of the root window to... I don't
know why, don't even try to open these gates of hell.

### And what does Xephyr do?
I suspect it to emulate only parts of the X protocol and somehow leaking the
hierarchy of windows above it's level (thus not inside the nested X instance),
as such a detail would explain why firefox changes it's behaviour when in a
non-reparenting WM that runs on a bare display vs. a virtual one.

This all points to firefox somehow disliking being the direct child of the root
window.  But… why should firefox care, exactly? I don't know. But we seem to
live in a crazy world.

## Now that we're through with the analysis...
... let's try to address the problem. I quickly hacked together a version of
`gabelstaplerwm` that does something remotely resembling the reparenting concept
of EWMH - it simply creates a fake root window and reparents everything else.
This approach is totally broken considering it ignores a lot of infrastructure
needed for a proper implementation, but that's what `git` branches are for.
So a few lines of XCB calls later... nothing changed.

This is a letdown. Moreover, other people don't have any issues on `xmonad`,
which apparently doesn't reparent either, and firefox.

Meh.

Sounds much more involved and I currently lack any further ideas. Maybe I
should check back on my fire-and-forget-implementation of reparenting and see
if it lacks some important bit.

## But why aren't your reparenting in the first place?
Similarly to the choices made by the `dwm` developers, reparenting simply
shouldn't be necessary for a tiling window manager which doesn't aim to provide
window decoration or similar features (see the
[README](https://github.com/ibabushkin/gabelstaplerwm/blob/master/README.md)
for the reasons). It's more complicated than necessary and involves a lot
of mechanical work.

That's enough reason for me. Sadly, at least some apps (\* *cough* \* Java \*
*cough* \*) have had problems with that, so I might implement a simple variant
to avoid that.

That's it for now.
