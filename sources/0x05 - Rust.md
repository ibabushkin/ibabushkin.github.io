# My encounter with Rust
I heard a lot about the Rust language. That's nothing unexpected
given the publicity the language gets on Reddit, HN and the likes,
but I felt intrigued by the ideas and concepts behind it. I won't
reiterate now on the details of it's memory handling etc., but rather
give a quick recap of my first practical impression (I already tried
to learn it ~4 months back, but gave up due to lack of time and other
projects). Essentially, I discovered the [uutils](https://github.com/uutils/coreutils)
project, which is a great opportunity to learn the language by doing
something with it.

Maybe I should explain why this is such a big deal for me: I prefer
it if my work, even while learning a new technology, is of use (to anyone,
including myself). Given that requirement my psyche doesn't let me lift,
I am often stuck in a dilemma where I think I should use a lower-level
language such as C or Rust for a particular project I decided to work on,
but don't see a need/benefit in it (because it lends itself very well to Haskell,
for example). This called for the need of a project, where a systems programming
language is beneficial.

Given that, I picked up a few resources and started my most recent run
with Rust. So far it has been very entertaining and a pretty good experience.
The only *real* annoyance is the weird versioning system that restricts people
using Rust stable, which makes me wonder why it is even available in parallel
to the nightlies. Other things that made me go "hm?" included the special way
Rust treats iterators. They are indeed a very powerful tool for a more low-level
approach to functional programming, but their vast amount is a bit overwhelming,
especially if you are new to the language (and libraries) and every iterator has
it's own corner-cases.

Example: I want to iterate over the substrings of a `String` that are the result
of a call to split, but I want to do that in a separate function, so I'd like to
do the following
```Rust
// define our function
fn do_something(arg: Vec<String>) -> SomeResultType {
    // do stuff with the vector
}
// and call it like this:
// do_something(some_string.split("bla").collect());
```
But I can't, because the corresponding Trait needed for the call to `collect()` isn't
implemented for `Vec<a>`. Okay. I'd love to know why. I probably miss some important
bit here, but this is a bit frustrating. I probably could just pass the `Split`-iterator
to my function, but this requires more interaction with lifetimes, and I don't see
a reason for that here, as the usecase should be fairly simple.

Apart from such small issues, my experience with language and tooling has been great,
and I look forward to doing more with it.

## Update: a few weeks later
I got more practise with the language (more on my projects in that realm later).
Now it also makes sense that iterators of different types are structs - they are lazy.
This was unexpected given my Haskell background, where such things are included in the
type system itself, but it is good to know. I also feel that I am getting close to
understanding the more complex/involved concepts in the language (lifetimes for instance).
(So I am fighting the borrow checker less and less, instead I fight tooling and library
infrastructure - as I said, I will elaborate on that later). Other things like generics
didn't hold much surprises after Haskell and C.
