# X is a Can of Worms - Writing a Window Manager in Rust
As promised in the last entry, I'll write a bit about my first larger
Rust project: A window manager using the XCB bindings to the X protocol.
I chose this for a multitude of reasons:

* Xlib has a lot of issues with performance, bloat and bugs, and all WM's
  I know of that are written in Rust use this interface - although there are
  bindings to the XCB library, which has neither of those issues.
* Some features and ideas that apply to (tiling) window manager design and
  development aren't realized to their full potential in my opinion -
  particularly the differentiation between static and dynamic tiling window
  managers allows for further development.
* Learning Rust *properly* in a bigger project is something worth my time,
  especially as this involves a more low-level project.

In conclusion, such a task fills a gap. Why not fill it?

At this point you might ask yourself
> Why the salty title?

The answer is pretty simple: XCB is very poorly documented, and it's extension
libraries don't even announce their existence properly on the web. Yes, you've
heard that one right - the extension libraries that provide functions to implement
[EWMH](https://en.wikipedia.org/wiki/Extended_Window_Manager_Hints) (more on that later)
and other things lack everything but the source code.

When I finally found them, got the source and thought about providing Rust bindings,
I was greeted by two levels of `m4` and `CPP` macros. Very... inviting. This quickly
rendered my idea pretty useless - even providing Haskell bindings for Capstone wasn't
an entirely pleasant experience, a fair bit was boring, the rest is documented here -
and this libraries would be much worse: Apparently, the code is preprocessed heavily,
and for some reason constants whose origin I was unable to trace get replaced as well.

Long, boring story short: I was able to find the implementation of the functions
commonly used by C window managers to emulate the same procedures in Rust.

However, writing code for a big, legacy-ridden protocol is a bit tedious and
documentation is abysmal as I mentioned already.

To conclude these pointless ramblings - It's not at all as bad as it sounds:
Basic structure is done already and progress is being made. When I have a solid
technical overview of the window manager ready, I will write about it. So far, you can
look at the code if you wish: [gabelstaplerwm](https://github.com/ibabushkin/gabelstaplerwm),
which is badly documented and ugly so far - that seems to be good taste in the world of
X programming.
