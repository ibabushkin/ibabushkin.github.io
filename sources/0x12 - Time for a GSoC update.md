# Time for a GSoC update
And again, a lot of time passed until I got to write a new entry here. This time however,
there will probably be some entries in the forseeable future as well, due to me
participating in the Google Summer of Code. This is the first entry in a small series
describing what I am working on, how and where progress is being made, and what else might
be relevant.

First things first, my project proposal etc. can be found [here][proposal].
It describes a rough plan on how to realize the project. To avoid rehashing it's contents
describing the project idea etc, I'll also link to the [two][t1] [threads][t2] I've
started on the rust-lang internals <s>mailing list</s> forums.

[proposal]: https://summerofcode.withgoogle.com/projects/#5063973872336896
[t1]: https://internals.rust-lang.org/t/semver-compatibility-tool-gsoc-proposal-draft-and-discussion/4926
[t2]: https://internals.rust-lang.org/t/gsoc-project-planning-semver-specification-and-tool-architecture-overview/5243

I guess that should be a sufficiently complete overview of the project's goals at least.
If not, well... drop me a line or something.

## Actual progress made so far
Now, a plan's a plan, but the actual implementation can... differ. So let's reiterate what
has been done so far.

The community bonding period I've spent pondering on how to approach the problem and how
to structure the code. I was already roughly aware *what* components I wanted to
construct, but not yet sure how exactly to structure and realize them. So I've read a lot
of sources, particularly the compiler itself (at least some of the more relevant bits) and
`rust-clippy`. A small custom compiler driver has been implemented as well, blatantly
ripping of clippy's code structure. Actually, some remnants of this early experiment are
still present in the code at the time of writing. Somewhere around the end of may, I had
the core idea how to fit the two crate versions together for analysis. The core concept is
rather simple, the implementation not so much (which is why my mentor, [eddyb][eddyb],
suggested a slight variation that has since then been implemented). The idea is to merge
the module hierarchies of the two crate versions by constructing a new crate in memory
that contains both module hierarchies in different submodules. However, this can get
pretty tricky if we have to translate paths to definitions all the time. Much simpler is
the alternative we settled on: construct a new crate in memory that references two crates,
`old` and `new` and links the two crate versions' rlibs using these names. This has the
drawback of needing completely built artifacts for both crate versions, but this is not a
significant disadvantage considering the tool is expected to be run once when a new
release is to be made.

[eddyb]: https://github.com/eddyb

At this point, I've delved into the mechanisms in the compiler that would allow me to
traverse the module hierarchy of the two crates and to compare them. Oh, and the coding
period (summer I guess) started.

An initial version that registered item addition and removal (most of them anyway) was
quickly implemented. And to register reexports properly, it recorded each path an item was
exported through, and compared the two sets (which got represented as a data structure in
memory). At this point, two problems have been identified: Firstly, spans from external
crates aren't rendered by the compiler's machinery that is used to show messages to the
user. And secondly, the traversal code was broken. There were multiple layers of breakage
there, but the core problem was that given a traversal scheme avoiding endless recursion,
some maliciously constructed module hierarchies got treated incorrectly. And, well, the
whole thing had exponential runtime characteristics. To address this, a new traversal
scheme has been implemented, which traverses both module hierarchies at the same time,
matches items up by identifier and registers the changes found that way. Pairs of modules
handled that way are recorded to guarantee termination.

Now, I've mentioned there was a second problem to handle. And since it's inherent to the
compiler's inner workings, it had to be adressed by modifying the compiler. Since we're
already using the compiler's internal data structures we're bound to using the nightly
release channel anyway. Initially it seemed like it would be enough to just fix the
translation of crate-external spans into the compiler's code map. The corresponding pull
request has already been [merged][pr1]. After I updated my nighly rust installation, I
quickly was able to verify that indeed, the spans were translated correctly (and contained
paths to the corresponding source files on disk), but the source still wasn't available.

[pr1]: https://github.com/rust-lang/rust/pull/42507

At this point more research has revealed that file maps that get decoded from rlib
metadata (which is to say, file maps coming from external crates) don't contain the source
code, since it'd be wasteful to stuff a ton of strings in each and every rlib just to
provide slightly nicer error messages that aren't really necessary most of the time.
However, this is probably something the compiler could also use if it was implemented.

So we derived the following scheme, that is still waiting for it's merge in this
[PR][pr2]: File maps contain the source code's hash, which also gets serialized. When a
deserialized file map is referenced through a span being rendered, we attempt to load the
source from disk and verify it's hash. If an error occurs, we mark the file map to avoid
further retries. Otherwise, we now have source. The method responsible for fetching lines
from a file map needed some adjustment to respect our new external source, which got it's
own member to avoid providing internal mutability for the regular source (since that'd be
a catalysator for bad ideas). This is enough to render arbitrary spans, provided that the
source of the dependencies we link to is left intact on disk (which should be the case for
most practical purposes). Also, a few refactoring opportunities were opened by this change
set which I shall address in the future.

[pr2]: https://github.com/rust-lang/rust/pull/42593

### Outlook
On that note we should also look at future work I want to do in the next ten weeks (and
possibly beyond those as well).

Apart from strictly unrelated changes to rustc I've already mentioned, the next steps
would be to actually use the new error reporting capabilities to provide detailed output
from our own tool. Apart from that the traversal of the module and item hierarchy has to
be extended further to register more changes than just item additions and similar
"high-level" changes. The [API evolution RFC][api] is used as a guideline here.

### Closing thoughts
This concludes my first post on my work in the summer of code. I know it's very chaotic
and unorganized (as all my writing), so feedback is very welcome. Just use the email
you'll find in the commits of the [repo][repo] I use to host the code for this project.
Oh, and I should thank [eddyb][eddyb] for, well, quite obvious reasons :)

[api]: https://github.com/rust-lang/rfcs/blob/master/text/1105-api-evolution.md
[repo]: https://github.com/ibabushkin/rust-semverver
