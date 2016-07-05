# More gabelstaplerwm News
Let's get straight to the point. A few nifty features have been added:

## Handling of already-present clients
...which is still useless because `gabelstaplerwm` still doesn't disown
it's children. And probably the most buggy part of the whole system.

## Logging
All output has been moved to `log` and `env_logger`, which are pretty
simple to use, and flexible. No more ugly pythonesque logging that clutters
everything it gets in touch with.

## Output capabilities
When I said all output in the last section, I lied. Because a new feature
has been added to allow for simple, extensible, and user-centric communication
with external components, such as bars, notification systems...

Now, every config macro can be passed any number of additional objects that get
printed out using the `Display` trait on stdout, after all the actions have
been performed, but before the WM redraws the screen or does whatever else
the closure returned by the macro commands it to do. This allows for demand-driven
output to a bar or any other component. For clarity, and to remove any possible
ambiguous cases for the compiler, the objects to be printed are separated by
semicolons, not commas:

```Rust
/// View a tagset by pushing it by index on the history stack.
///
/// Returns a closure for use with `bind!`.
macro_rules! push_tagset {
    ($index:expr $(; $print:expr)*) => {
        |_, s| {
            s.push($index);
            $( println!("{}", $print); )*
            WmCommand::Redraw
        }
    }
}
```

This is simple, convenient to use, and produces no overhead when inactive. It is
also extensible to the maximum and adds only a minimal amount of code (16 lines)
to the sources.

I'd say this is a win.

## New layouts and some rearrangements
Ha! Got the joke? Rearrangements? Layouts? Not funny? Okay.

Two new not-so impressing layouts: a `Grid` and a `Spiral`. Both are straightforward
to use and easy to explain.
The grid specifies a fixed number of columns and creates
as many lines of windows as needed, leaving empty slots on them if necessary.
The spiral layout is a right-biased spiral with a fixed ratio of 0.5.

Nothing exciting, but useful on occasion.

Other than that, the stack layouts have been moved to one single module `wm::layouts::stack`,
since they are very similar in implementation and don't clash. In the future, there might be
some room for code deduplication there.
