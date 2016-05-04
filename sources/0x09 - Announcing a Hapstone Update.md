# Announcing a Hapstone Update
As you may or may not have noticed, capstone is still under active development.
Even more importantly, a major version bump is about to happen, adding support
for the `M68K` architecture, and featuring other improvements along with some
sad little patches from yours truly.

This also means that `hapstone`, the now-officially-recognized Haskell bindings
for capstone will need an update as well, which I've begun working on. I plan
to port the additions to the API and data structures, as well as the `m68k.h`
header this month, so that a release is possible in time. This doesn't seem to
be too hard, two of the old architecture headers have been updated already, so
we can hope for quick progress. If all goes well, the version bump to
`hapstone 0.2.0.0` can be ready in about a month or two.

Apart from this it is probably time to get a new Haskell project out of my hat:
a long-awaited tool for decompilation in the spirit of some of my earlier work.
I think it would be a good idea to elaborate on the theoreticals in a blog post
soon.

So here we have a roadmap for Haskell-related projects. If I feel adventurous,
I might as well implement a new architecture for capstone - MMIX would be a
nice toy example and an excuse to write a bit about it and RISC in general.
Let's just hope that I will realize these ideas ;)
