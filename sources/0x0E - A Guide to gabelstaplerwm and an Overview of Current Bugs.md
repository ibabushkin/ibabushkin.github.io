# A Guide to `gabelstaplerwm` and an Overview of Current Bugs
And here we go again with a new post about `gabelstaplerwm`.
I figured I'm getting a bit annoying, but for some reason they just
keep coming. However, this time we will simply look at configuration management
and some observations I've made while attempting a transition to using it
full-time. Mind the "attempt", as I haven't done that yet. The reasons are
twofold: For once, I have a lot of things to do ;). And some bugs keep
manifesting, that make the process more painful than it has to be. See the
second part of the article for more information on that topic.

## Configuring `gabelstaplerwm`
The configuration system is heavily inspired by `dwm` and other
[suckless](http://suckless.org/) tools that are configured at compile time.
However, because rust is the programming language used, the process differs
a bit. The intended configuration done by the user is supposed to be
constrainted to the `src/wm/config.rs` file. That said, you probably want to
read the [source](https://github.com/ibabushkin/gabelstaplerwm) and
[documentation](https://ibabushkin.github.io/rustdoc/gabelstaplerwm/) anyway.
However, the most important concepts to grasp are the following:

* The structure present in the file is already sufficient for configuration.
  Look at the surrounding infrastructure to see how you can change it if you
  need to (for instance, if your configuration grows big enough to warrant
  such a change).
* A lot of the repetitive calls and closures needed in a typical configuration
  are abstracted away using a set of macros located in `src/wm/util.rs`. Make
  sure to look at those if you find yourself writing a lot of boilerplate.
* If you think that you've found something that is worth adding to the core of
  the window manager, feel free to contribute that change back! The config
  system would only benefit from more sets of hands (and eyes) that have
  touched it.

Now let us walk through the default configuration to illustrate on the above
points. We will focus on keybindings in particular, but also on the other
features.

### Defining `Tag`s
Tags are an enum with members that that represent individual tags windows can
be associated with. Don't alter the derived traits. Or rather, make sure those
traits are implemented in a sane fashion. Also see the implementation of the
`Display` trait, you might want/need to alter it.

### Defining Keyboard `Mode`s
Modes are an enum as well, and all things that apply to the `Tag` enum apply to
them as well. In both cases you should make sure that they are not empty and
present.

### Setting a window manager `Config`
The `generate_config` function is responsible for that part. Leave it's type
signature unaltered (or alter the infrastructure in `src/main.rs`) and do the
obvious things you need with it. Note that it is a function to allow for
dynamic generation of a suitable config during startup. This will allow for
greater flexibility in the future, when multimonitor support is added.

### Doing all other configuration work on startup
The `setup_wm` function gets passed a mutable reference to the newly created
window manager object. This is the place where keybindings are added, `TagSet`s
are initialized and the client matching is set up. Note the usage of macros
for keybinding-related tasks. The individual keys are identified by keycode
and modifier set. To see the related constants, check out the `src/wm/kbd.rs`
file for the modifier constants and type information for the callback closures.
The `gabelstaplergrab` utility might be of use as well to determine the
keycodes of the keys you want to bind to, just run it instead of a window
manager, possibly with `Xephyr`. The `xephyr` script in the toplevel directory
wraps that bit.

## Known bugs and limitations
Firefox's UI is extremely laggy on my computer (integrated Intel card).
I don't know the reasons, and I can't reproduce it using `awesomewm`. However,
myself and some people in `#lobsters` on freenode experienced the same problems
in `dwm`. Given that I've read the source code of the latter, I suspect that
firefox expects the window manager to do some fancy things that the more
minimalistic ones refuse to do. This is all the more surprising considering
that I can't reproduce it using `Xephyr` and that no apparent increase in
resource usage is visible. This will need more serious investigation, but I
fear that this is an issue I won't be able to solve trivially.

After some discussion with people on IRC I suspect the fact that reparenting
might be a feature firefox in some way assumes to be present, which might cause
this bug. If this is the case, I will have a lot to do :).

For more information, see the list of issues [here](https://github.com/ibabushkin/gabelstaplerwm/issues).
