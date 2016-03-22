# The Long Journey in Search of a Good API Wrapper
Today I will return to talking about my project to provide Haskell
bindings for Capstone. What a surprise. However, I regard the technical
realization of the low-level bindings as done or mostly done, so instead
I'll focus on the stuff mentioned in the heading.

First off, let's look at the motivation to provide anything beyond what's
done already. As things are now you can essentially write C-style Haskell
that calls back into Capstone (even callbacks should be possible). That's
great and all, but not exactly *idiomatic*. An idiomatic way to accomplish
the same things would be to have a non-stateful, preferably pure API.

However, this isn't a straightforward task, as a significant percentage of
Capstone's API (see
[include/capstone.h](https://github.com/aquynh/capstone/blob/master/include/capstone.h))
relies on the presence of an opaque handle that is internally used as a pointer
to an internal structure that holds function pointers and other data.

Indeed, functions like
```C
bool cs_reg_write(csh handle, const cs_insn *insn, unsigned int reg_id);
```
are implemented as a lookup and call of a function pointer, as different
architectures can plug in their own implementations in a seamless manner
using that approach. In Haskell, such a function would remain entirely pure,
but in this context, this is rendered impossible. 

Currently, two approaches seem feasible to tackle this:

1. Make each pure function an `unsafePerformIO` call on an action that allocates
   a suitable handle and cleans up afterwards - smells of bad style and wastes
   resources left and right.
2. Develop some framework to perform all handle-dependent computations first
   and make that information available on-demand. This should be a good approach,
   and is probably versatile enough. That way something like

```Haskell
disasmWithAction :: CsArch   -- ^ architecture (needed for handle)
                 -> [CsMode] -- ^ modes (needed for handle)
                 -> [Word8]  -- ^ buffer to disassemble
                 -> Word64   -- ^ address of first byte in buffer
                 -> Int      -- ^ number of instructions to disassemble
                 -> (Csh -> CsInsn -> IO a) -- ^ user-supplied action
                 -> IO (Either CsErr [(CsInsn, a)])
```
   would fit almost all needs. Moreover, it should be safe to wrap in `unsafePerformIO`.
   However, this would require some restrictions on the user-action. More on this in
   another blogpost.

These approaches, combined with some typesystem magic for additional safety,
should be pretty effective for what I need right now. When they are actually
implemented, I will elaborate on that as well.
