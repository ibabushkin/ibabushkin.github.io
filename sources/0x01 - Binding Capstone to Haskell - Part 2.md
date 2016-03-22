# Binding Capstone to Haskell - Part 2
Welcome to part two of my series on the development of Haskell bindings for the
capstone disassembly framework. Today I will mainly focus on some technical
details as well as the decisions made regarding the questions that arose in
[part 1](Binding Capstone to Haskell - Part 1). But first, a small recap of the
work already done.

## Current progress
So far, I have started the project and wrote a good deal of code to do the
actual work needed. This involved setting up `stack` in a proper fashion, which
turned out to be a breeze, as it runs preprocessors as needed out of the box.
This especially means that using `c2hs`, which after short inspection revealed
itself as the most suited tool for the job is pretty easy and well-integrated
as well.

So I started porting the headers that capstone puts into
`/usr/include` on my arch installation, and which are available on their
[github presence](https://github.com/aquynh/capstone/tree/master/include).
This is fairly easy, but at some point I started to hit weird errors in `GHCI`
regarding compilation to bytecode. Some further analysis showed that this was
due to the usage of user-defined in-marshallers in `fun`-hooks. Hm. I don't
really know what is causing this issue, and so far there are only two
candidates: `c2hs` and `GHCI` itself. This needs a more through look.

Most of the headers are pretty straightforward: porting enumerations is pretty
easy if you can reduce the typing necessary to one line:

```Haskell
{#enum arm64_shifter as Arm64Shifter {underscoreToCase} deriving (Show)#}
```

And most of the architecture-specific headers consist to 90-95% of such
enumerations. Much more intriguing is the marshalling of structures, as `c2hs`
provides no mechanism to automate that task. Moreover, anonymous unions don't
seem to be supported *at all*, so I had to work around that somehow. To make
this post less boring, I'll include my first (and so far only) attempt to
marshal such a complex structure from C to Haskell. It involves some
offset-oriented hacks that might break, but I need some digging into
disassembly and/or relevant standard specs to say anything specific.

And here, in all it's glory, a snippet that represents an instruction
operand of the ARM64 aka ARMv8 architecture (boring parts omitted, code taken
from `arm64.h`):

```C
// Instruction operand
typedef struct cs_arm64_op {
  int vector_index; // Vector Index for some vector operands (or -1 if irrelevant)
  arm64_vas vas;    // Vector Arrangement Specifier
  arm64_vess vess;  // Vector Element Size Specifier
  struct {
    arm64_shifter type; // shifter type of this operand
    unsigned int value; // shifter value of this operand
  } shift;
  arm64_extender ext;   // extender type of this operand
  arm64_op_type type; // operand type
  union {
    unsigned int reg; // register value for REG operand
    int64_t imm;    // immediate value, or index for C-IMM or IMM operand
    double fp;      // floating point value for FP operand
    arm64_op_mem mem;   // base/index/scale/disp value for MEM operand
    arm64_pstate pstate;    // PState field of MSR instruction.
    unsigned int sys;  // IC/DC/AT/TLBI operation (see arm64_ic_op, arm64_dc_op, arm64_at_op, arm64_tlbi_op)
    arm64_prefetch_op prefetch;  // PRFM operation.
    arm64_barrier_op barrier;  // Memory barrier operation (ISB/DMB/DSB instructions).
  };
} cs_arm64_op;
```

and the corresponding Haskell datatype and it's `Storable` instance

```Haskell
instance Storable CsArm64Op where
    sizeOf _ = {#sizeof cs_arm64_op#}
    alignment _ = {#alignof cs_arm64_op#}
    peek p = CsArm64Op
        <$> (fromIntegral <$> {#get cs_arm64_op->vector_index#} p)
        <*> ((toEnum . fromIntegral) <$> {#get cs_arm64_op->vas#} p)
        <*> ((toEnum . fromIntegral) <$> {#get cs_arm64_op->vess#} p)
        <*> ((,) <$>
            ((toEnum . fromIntegral) <$> {#get cs_arm64_op->shift.type#} p) <*>
            (fromIntegral <$> {#get cs_arm64_op->shift.value#} p))
        <*> ((toEnum . fromIntegral) <$> {#get cs_arm64_op->ext#} p)
        <*> do
            t <- fromIntegral <$> {#get cs_arm64_op->type#} p :: IO Int
            let bP = plusPtr p -- FIXME: maybe alignment will bite us!
                   ({#offsetof cs_arm64_op.type#} + {#sizeof arm64_op_type#})
            case toEnum t :: Arm64OpType of
              Arm64OpReg -> (Reg . fromIntegral) <$> (peek bP :: IO CUInt)
              Arm64OpImm -> (Imm . fromIntegral) <$> (peek bP :: IO Int64)
              Arm64OpCimm -> (CImm . fromIntegral) <$> (peek bP :: IO Int64)
              Arm64OpFp -> (Fp . realToFrac) <$> (peek bP :: IO CDouble)
              Arm64OpMem -> Mem <$> (peek bP :: IO Arm64OpMemStruct)
              Arm64OpRegMsr -> (Pstate . toEnum . fromIntegral) <$>
                 (peek bP :: IO CInt)
              Arm64OpSys -> (Sys . fromIntegral) <$> (peek bP :: IO CUInt)
              Arm64OpPrefetch -> (Prefetch . toEnum . fromIntegral) <$>
                 (peek bP :: IO CInt)
              Arm64OpBarrier -> (Barrier . toEnum . fromIntegral) <$>
                 (peek bP :: IO CInt)
              _ -> return Undefined
    poke p (CsArm64Op vI va ve (sh, shV) ext val) = do
        {#set cs_arm64_op->vector_index#} p (fromIntegral vI)
        {#set cs_arm64_op->vas#} p (fromIntegral $ fromEnum va)
        {#set cs_arm64_op->vess#} p (fromIntegral $ fromEnum ve)
        {#set cs_arm64_op->shift.type#} p (fromIntegral $ fromEnum sh)
        {#set cs_arm64_op->shift.value#} p (fromIntegral shV)
        {#set cs_arm64_op->ext#} p (fromIntegral $ fromEnum ext)
        let bP = plusPtr p -- FIXME: maybe alignment will bite us!
               ({#offsetof cs_arm64_op.type#} + {#sizeof arm64_op_type#})
            setType = {#set cs_arm64_op->type#} p . fromIntegral . fromEnum
        case val of
          Reg r -> do
              poke bP (fromIntegral r :: CUInt)
              setType Arm64OpReg
          Imm i -> do
              poke bP (fromIntegral i :: Int64)
              setType Arm64OpImm
          CImm i -> do
              poke bP (fromIntegral i :: Int64)
              setType Arm64OpCimm
          Fp f -> do
              poke bP (realToFrac f :: CDouble)
              setType Arm64OpFp
          Mem m -> do
              poke bP m
              setType Arm64OpMem
          Pstate p -> do
              poke bP (fromIntegral $ fromEnum p :: CInt)
              setType Arm64OpRegMsr
          Sys s -> do
              poke bP (fromIntegral s :: CUInt)
              setType Arm64OpSys
          Prefetch p -> do
              poke bP (fromIntegral $ fromEnum p :: CInt)
              setType Arm64OpPrefetch
          Barrier b -> do
              poke bP (fromIntegral $ fromEnum b :: CInt)
              setType Arm64OpBarrier
          _ -> setType Arm64OpInvalid
```

Most of the code is self-explanatory after a lecture of the `c2hs` docs
and the basic idea behind the `Storable` typeclass. Some interesting bits
are the large case-expression near the end. This is my take on porting C-style
tagged unions to sum datatypes in Haskell. This could be much more pleasant
if anonymous unions were supported by `c2hs`, but instead I had to rely on ugly
pointer juggling to get to the memory location of interest. This might need
fixing. Most of the other structures should be similar (I haven't done them
yet). Another bit worth showing off before I get the code on GitHub is the
heart of capstone's API: `cs_disasm`. Because of the issues with `GHCI`
mentioned earlier, I resorted to writing the marshalling by hand (see
`capstone.h` for the C source):

```C
size_t cs_disasm(csh handle,
    const uint8_t *code, size_t code_size,
    uint64_t address,
    size_t count,
    cs_insn **insn);
```

The corresponding Haskell code:
```Haskell
foreign import ccall "capstone/capstone.h cs_disasm"
    csDisasm' :: Csh -- handle
              -> Ptr CUChar -> CSize -- buffer to disassemble
              -> CULong -- address to start at
              -> CSize -- number of instructins to disassemble
              -> Ptr (Ptr CsInsn) -- where to put the instructions
              -> IO CSize -- number of succesfully disassembled instructions

csDisasm :: Csh -> [Word8] -> Word64 -> Int -> IO [CsInsn]
csDisasm handle bytes addr num = do
    array <- newArray $ map fromIntegral bytes
    passedPtr <- malloc :: IO (Ptr (Ptr CsInsn))
    resNum <- fromIntegral <$> csDisasm' handle array
        (fromIntegral $ length bytes) (fromIntegral addr)
        (fromIntegral num) passedPtr
    resPtr <- peek passedPtr
    free passedPtr
    res <- mapM (peek . plusPtr resPtr . ({#sizeof cs_insn#} *)) [0..resNum]
    csFree resPtr resNum
    return res
```
The code should be pretty simple to understand as well, but I thought it is
equally fun to read as it was to write (especially the memory handling).

Another bit worth mentioning is the handling of overflows in the marshalling
code. In general, we have two choices: either cut off the superfluous data, or
raise errors. I've resorted to the latter, but I might have to rethink that
decision one day. 

That's it for now, I'll add subsequent articles when some progress has been
made.
