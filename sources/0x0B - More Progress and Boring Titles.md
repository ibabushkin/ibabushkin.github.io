# More Progress and Boring Titles
The last few weeks (days? When did I write my last entry again?) have been
pretty interesting in terms of things being done. Let's reiterate on them and
ponder on some existential… whatever, let's get to business.

## gabelstaplerwm - The Good …
I finally reworked the entire client and tag handling. The new structures are
much cleaner, work more reliably, efficiently, and are more correct in terms of
general behaviour. Now, the `ClientSet`, which is a successor to `ClientList`
manages order of clients on sets of tags as well, allowing for far greater
control over how windows are displayed. Other features known from `awesomeWM`
have been implemented as well - i.e. you can now actually use most of the code
written over the course of the last few months. A lot of cleanup has been done
as well, a default config is underway and other nice things.

## … The Bad …
However, a lot of things have yet to be done - tagset based ordering of clients
depends on the order of the tags (sets, I know, this will be fixed), some old
bugs still haven't been resolved, some code is plain bad (looking up window
properties from Rust with no idiomatic binding to XCB is a pain), and lots of
things are half-baked and in the making.

## … And The Ugly
Now, I want to reiterate the debugging story associated with a particularly
nasty bug I triggered while implementing unmanaged windows. These are windows
we don't want to force in our tiled layout - notifications, bars, popups…
These are stored in a vector in our `WindowManager` structure, and elements
are pushed upon arrival and removed if a destroyed window is in the vector.
This process is also quite fast, because pushing has an amortized cost of
$O(1)$, and `Vec::swap_remove()` has as well, which we can use because we don't 
care about the order of windows in our vector (since we don't manage them
anyway).

Now, when we get a notification from the X server that a window has been
destroyed, we need to remove the associated client structure we might have
created. However, due to a weird trait my terminal emulator of choice has,
checking whether the removal of the client structure succeeded and basing
redrawing and refocusing decisions on that led to a strange race condition
which broke redrawing.

Now you rightfully wonder: what kind of feature of a client can break things
this way? The answer: [`termite`](https://github.com/thestinger/termite)
creates multiple children of the root window. Why? Because... GTK tells it to.
I don't really know, to be honest. However, I assume the reason are the overlays
that `termite` creates to implement URL hinting and other things. Their number
matches the number of window-creation messages `gabelstaplerwm` receives, and
it seems to make sense in general - i.e. I don't see a different explanation.

This bug has been fixed in the last commit at the time of writing. I am not
sure about it's nature and I didn't have the time and energy to find out what
*exactly* is causing it, research on race conditions in the context of X didn't
turn up anything valuable either.

## How JSMN Fucked Me Over
Currently, the development of `swtb` has come to a halt. There is one specific
reason to this: the JSON parser I decided to use for it's minimalism and
simplicity seems to be either buggy or not intended to be used how I do it.
The last token from a batch of JSON data simply isn't parsed correctly, although
there is no doubt about the well-formedness of the inputs. This will likely see
a fix soon, but for some time, I halted development for reasons of frustration.

## Other Interesting Things
More like one thing, really. I started reverse-engineering a DVD with a digital
library on it. This is purely for fun, as the material isn't subject to
copyright anymore, but I am interested in the internal workings of the weird
binary file format used by the application. For reasons unknown, whitespace is
encoded, while regular textual data is not. Also, file offsets,
cross-references, and data are intermixed in one huge binary file. However, this
post is growing into a collection of incoherent threads of narrative, so I will
write another post when I have enough findings to present.

That's it, what did you expect?
