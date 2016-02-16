# Binding Capstone to Haskell

This blogpost is a few different things at the same time:

* a roadmap for a pet project of mine
* a (~~more or~~ less) detailed analysis of Haskell's FFI
* a bag of design decisions and ideas

Given that nature, it will be pretty tangled and probably updated
on a regular basis, as I haven't even decided on the most basic things
regarding the subject. Sounds unclear and pointless? That's by design :)

## Motivation (or how you want to call it)
Essentially, capstone is *the* disassembler library. It also gives you
a pretty big set of bindings to different languages, like Python, OCaml, ...
Just not Haskell. I don't know why, but that's how it is. And, coincidentially,
I need a proper disassembly library in Haskell, as I want to

1. rewrite [Iridium](http://github.com/ibabushkin/Irdium) in a more
   sophisticated manner
2. get something more sophisitcated than the `disassembler`
   package into the Haskell ecosystem
3. get to know the FFI better (that's a nice side-effect)

## Concept
I won't line out how the FFI in Haskell is supposed to work or how you have
to set up cabal and/or stack to work with it, instead I will focus
on design decisions needed when building the abstractions necessary to
wrap an API as complex as capstone's. This is mostly due to the fact that
capstone has an API based on a strucure allocated for usage in subsequence calls.
This doesn't map well to Haskell's immutable data and pure functions. We essentially
have two options: either wrap all of capstone's API in functions running in
the `IO` monad, or allocate a new structure for each API call and wrap it in a high-
level, pure API on the Haskell side of things. Both approaches have their benefits and
drawbacks, and those will be the subject of this article.

On the one hand, wrapping everything in simple `IO` functions is the most simple
and easy to implement solution, as it just requires moderate usage of tools like `hsc2hs`
and some boilerplate code, as well as the actual FFI code. However, it limits our options
regarding the usage of the library: we will need to perform all computations regarding
disassembly in the `IO` monad, without actually requiring it's functionality. That's clearly
something we could optimize, right?

As it turns out, the other option is attempting exactly that, but is facing a performance
drawback: If we need to allocate new structures for each subsequent call, we add quite a lot
of overhead, as we have no way of allocating the structures needed and pass them around in pure
functions. However, the ergonomics of such an API are much better.

At the moment, I am leaning towards the second solution, as I am certain that the first
poses no real value (as a C implementation of all your code dealing with disassembly would
likely be equally fast and even easier to interface to). However, the performance drawbacks
and other problems of that approach need to be carefully evaluated. Maybe I'll find a compromise
to combine the two approaches in a sane manner. Ideas in that direction would be a use of `Stata`,
both API's for different usecases, and so on.
