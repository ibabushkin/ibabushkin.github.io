# Progress on gabelstaplerwm
As mentioned in the last post, I've begun working on my very own window manager
written in Rust. And it has been a success so far, even though most of the problems
with X itself are still present and keep me up at night.

However, some progress has been made, on which I will reiterate now.

First of all, the core of the window manager is working and reasonably performant, and
the necessary interfaces and data structures have been implemented.  Among the things
that work are:

* window focus
* layouts and tags
* redrawing on demand
* keybindings
* user config in a seperate Rust file

However, some things still need to be implemented:

* properly working window borders (ATM colors behave weirdly)
* launching things and other additional functionality
* more config features

So much for today, the code is at the same place:
[gabelstaplerwm](https://github.com/ibabushkin/gabelstaplerwm).
