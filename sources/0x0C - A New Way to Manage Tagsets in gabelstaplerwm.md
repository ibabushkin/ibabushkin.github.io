# A New Way to Manage Tagsets in gabelstaplerwm
So lately I have been talking about implementing a new system to manage tagsets.
Oh, I just checked - I have not. Well, what a coincidence that I currently have
a `vim` open, eh? Not funny? Okay.

I quickly came to the conclusion that a simple stack is a datastructure way too
inflexible to store all data needed to handle tagsets in an efficient and
generally nice manner. It is fine to store a history of references though.

As such, it sticked around for the last revision of `gabelstaplerwm`, but got
significantly transformed to fit the requirements. Specifically, I am talking
of the `TagStack` structure here, for anyone who is reading the sources. The
main change is simple: `TagSet`s are persistent now and are addressed by
arbitrary values of type `u8`. A small stack stores the keys of the last four
shown `TagSet`s. The structure permits modifying the `TagSet`s in place or add
new ones. At the moment, the user can - running the default config - edit the
tagsets in a special keyboard mode - modal interfaces are already implemented.
This moves away from the concepts already familiar from the fathers of this
project: `awesome` and `dwm`. For two reasons:

* now, each tagset shown, no matter how many tags it encompasses, is first-class
* tagsets are associated with keybindings and change with time

However, this is not a complete break of compatibility - you can still use the
same paradigms as before, but they have evolved. And this is just the beginning:
A better default config file, which I currently work on, would allow even more
sensible dynamism in the ways it handles tagsets. This would involve adding
copy-on-write functionality to the `TagStack` and allow for a different way to
bind keys on the keyboard to keys in the struct.

So far, however, the situation has already improved quite a bit. If we now add
a way to display information on tag sets etc, the window manager would become
fully usable. For now, I should reiterate what needs to be done at this point:

* add a output interface for a bar or something similar
* add full support for notifications
* add other features previously discussed
* add more layouts
* add proper color handling, the current one sucks massively

However, with a lot of will, it is already possible to use this. Have fun.
