# Binding Capstone to Haskell - Part 3
In my last post, I described the steps taken to bring capstone to the Haskell
ecosystem. Today I will add a quick update on the progress I made.

First off, let's look at our roadmap:

* [x] port the data structures from the architecture headers
* [x] port the data structures used by the disassembly API (`cs_detail` etc.) 
* [x] port the disassembly API
* [x] write tests for the numerous `Storable` instances we wrote
* [x] verify the type-safety of the marshalling code
* [x] write high-level wrappers around the 1:1 bindings
* UPDATE: all done, version bump to `next` branch soon

We have done the majority of the hard work already, even if it doesn't look
like that. The code written needs to be verified still, but that's an ongoing
process. A special case is the second point:

> port the data structures used by the disassembly API (`cs_detail` etc.) 

The main problem (actually the only thing left to do) is the presence of an
untagged union in `cs_detail` that contains architecture-specific data (which,
one might argue is the single most important bit). The original C API has no
need to tag said union because it is accessed from a context where the caller
(apparently) knows what architecture is being worked with, because the given
structures are obtained from APIs that got the arch as a parameter. In our
case, however, this poses a problem. I still have to figure this one out, but
the most "clean" (mind the quotes) solution is to write separate functions for
each possible case and encapsulate them in the higher-level API wrapper.

The code, for illustration purposes:
```C
typedef struct cs_detail {
  uint8_t regs_read[12]; // list of implicit registers read by this insn
  uint8_t regs_read_count; // number of implicit registers read by this insn

  uint8_t regs_write[20]; // list of implicit registers modified by this insn
  uint8_t regs_write_count; // number of implicit registers modified by this insn

  uint8_t groups[8]; // list of group this instruction belong to
  uint8_t groups_count; // number of groups this insn belongs to

  // Architecture-specific instruction info
  union {
    cs_x86 x86; // X86 architecture, including 16-bit, 32-bit & 64-bit mode
    cs_arm64 arm64; // ARM64 architecture (aka AArch64)
    cs_arm arm;   // ARM architecture (including Thumb/Thumb2)
    cs_mips mips; // MIPS architecture
    cs_ppc ppc; // PowerPC architecture
    cs_sparc sparc; // Sparc architecture
    cs_sysz sysz; // SystemZ architecture
    cs_xcore xcore; // XCore architecture
  };
} cs_detail;
```

That's it for now. Also, you can check out the code (evolving, so not
working yet) on [github](https://github.com/ibabushkin/hapstone).
