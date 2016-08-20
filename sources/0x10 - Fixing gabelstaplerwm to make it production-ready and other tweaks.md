# Fixing gabelstaplerwm to make it production-ready and other tweaks
Last time I talked about firefox causing issues in gabelstaplerwm. Those have
been fixed by a magical driver update. Yay I guess?

Now, ironically, browsers remain the main focal point of weird bugs and
behaviours in this piece of software. We'll traverse those in chronological
order and look at other things I did in the past... was it two weeks?

## Act I: `uzbl` freezing the window manager
First issue - the browser `uzbl` manages to freeze the window manager when a
specific usage pattern is encountered. Attaching `gdb` yields an interesting
result: the process receives a `SIGTTOU` while it's executing...  a `poll()`
call in XCB's event waiting routine. Now that's unexpected, after all the
process isn't accessing the TTY it was started on at that point in time.

Now after some conversation, a few beers and some experimentation I got on the
right track: The `uzbl` instance that I used to trigger the bug was spawned as
a child of the window manager (with some `dmenu` instance inbetween). And...
stdin, stdout and stderr are inherited from the parent process in such a case.
So essentially, uzbl was causing the `SIGTTOU` to be sent, and locked up both
the window manager and itself. Now why is this always happening at the same
address in the window manager's code? The answer is simple once you realize
that the user^M^M^M^M I caused the offending behaviour of the browser in the
first place. Thus, the window manager was waiting for events using a `poll()`.
This meant that the kernel has put the process to sleep at that time and it
didn't get any chance to do anything else before being delivered a nice warm
signal causing it to stop. The fix is trivial at this point: redirect your
output. Luckily, this is the intended usage of `gabelstaplerwm` anyway, but I
hadn't set that up at that time.

## Act II: Display issues with GnuPG's GUI
This one was due to the GTK dialog box not playing well when it's wishes of
being treated specially didn't receive proper attention. This triggered me to
rewrite the property lookup code to write a nifty generic-set based implementation:

```Rust
/// get a set of properties for a window, in parallel
fn get_property_set(&self, window: xproto::Window,
                    atom_response_pairs: Vec<(xproto::Atom, xproto::Atom)>)
    -> Vec<ClientProp> {
    let mut cookies: Vec<_> = atom_response_pairs
        .iter()
        .map(|&(atom, response_type)|
            xproto::get_property(
                self.con, false, window, atom, response_type, 0, 0xffffffff
            )
        )
        .collect();
    let res = cookies
        .drain(..)
        .zip(atom_response_pairs.iter())
        .map(|(cookie, &(_, response_type))|
            match response_type {
                xproto::ATOM_ATOM => if let Ok(r) = cookie.get_reply() {
                    let atoms: &[xproto::Atom] = r.value();
                    if atoms.len() == 0 {
                        ClientProp::NoProp
                    } else {
                        ClientProp::PropAtom(atoms[0])
                    }
                } else {
                    ClientProp::NoProp
                },
                xproto::ATOM_STRING => if let Ok(r) = cookie.get_reply() {
                    let raw: &[c_char] = r.value();
                    let mut res = Vec::new();
                    for c in raw.split(|ch| *ch == 0) {
                        if c.len() > 0 {
                            unsafe {
                                if let Ok(cl) = str::from_utf8(
                                    CStr::from_ptr(c.as_ptr()).to_bytes()) {
                                    res.push(cl.to_owned());
                                }
                            }
                        }
                    }
                    ClientProp::PropString(res)
                } else {
                    ClientProp::NoProp
                },
                _ => ClientProp::NoProp,
            }
        )
        .collect();
    res
}
```

This approach essentially lets me pull multiple properties with interleaved
requests and takes care of all the heavy lifting and datatype wrapping. It is
surely not the holy grail of elegant Rust code, but it does it's job reasonably
well, making property lookup for new clients pretty straightforward.

## Act III: Firefox unable to display some dialog boxes
This issue is still unresolved and needs more work from my side. Just thought
I'd mention it's existence for an ironic effect.

## Act IV: `vdrift` freezing the window manager
Yes, I sometimes play computer games. In this particular case, the window
attribute the window manager relies on to decide whether the window is to be
mapped when it's type is `_ǸET_WM_TYPE_NORMAL` seems to be set only after the
window sends a request to be mapped. This still needs to be solved. Actually, I
have forgotten an act in this magnificent play of weird interaction between
software components: the attribute in question is `_NET_WM_NAME`. It is checked
only to prevent some weird dummy windows from getting client structures and not
going away.

## Different storyline: more homegrown tools for my (or your) desktop
I have written a small multiplexing tool to pipe multiple sources of data into
a bar. This works by spawning a thread for each source of data and performing
blocking reads on the source (or some semantic equivalent) and send new values
over a channel to the main thread that manages updating and outputting a
formatted version of all data units. However, while writing this in Rust I
noticed a few things:

* using a `BufReader` and getting blocking semantics is... awkward. As in,
  had-to-call-to-libc awkward.
* using `poll(3)` on a FIFO is also pretty awkward. If no process is currently
  attached to the input end of the FIFO, `poll` returns immediately and signals
  a `POLLHUP`. Opening the file descriptor in read-write mode avoids this
  issue.
* some parts of Rust's standard libary still need some love.

The whole thing goes by the name of `bartender`, read the
[README](https://github.com/ibabushkin/bartender) for more information.
