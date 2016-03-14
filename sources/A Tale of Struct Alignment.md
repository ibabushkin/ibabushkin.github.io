# A Tale of Structure Alignment
This is another article on the ongoing process of providing bindings for
Capstone in Haskell, but this time it is (kinda) in disguise. The main idea
here is that the topic covered is *not* specific to this project and affect
much more. 

Said topic is structure alignment, regarding C code. A quick recap why I even
care about it when writing bindings in Haskell: There is no way of porting
structs without a preprocessor like `c2hs` or `hsc2hs` and without resorting
to offset-based manipulations of the data. That's a bummer for portability,
as well as the maintenance needed for your code. Thus, working without one of
the mentioned preprocessors (or `GreenCard`, which I haven't looked at) is
not really viable for everything but the most basic projects. Given these
circumstances, I resorted to using `c2hs`, because it offers some facilities
to port enumerations, which capstone uses almost everywhere. However, it has
some drawbacks that annoy me:

* no support for C11 (seems to be a `language-c` issue, which `c2hs` uses)
* weird assumptions about some things (more on that later)
* bad integration with tools like `hlint`, because those fail to parse the
  syntax of the preprocessor. There isn't much I (or the `c2hs` devs) can do
  here, but it is a drawback nonetheless)

## Problem Description
Before we dive into the issues described above, let's look at the actual issue
with structure alignment (it's not even an issue, really). The key lesson to
take away is that many hardware platforms either force you to or work more
efficiently if machine words are read from and written to addresses that are
divisible by the size of the word in question. That is, a four byte wide
integer would be placed at an address divisible by four and so on. This leads
to some rules for structures and unions. Imagine the following struct:
```C
typedef struct some_type_name_t {
    int32_t member_a; // 4-byte aligned
    double member_b;  // 8-byte aligned
    uint8_t member_c; // 1-byte aligned
    int16_t member_d; // 2-byte aligned
} some_type_name_t;
```
We are being conservative here, so we need to align the struct by the largest
boundary amongst it's members. In this case, 8 byte. So we go from that and
imagine the memory layout (the entirety of the diagram is one struct instance):
```
   +-0123-+
0  | xxxx | <- member_a starts here
4  |      |
8  | xxxx | <- member_b starts here
12 | xxxx |
16 | x xx | <- members c and d are here.
20 |      |
   +------+
```
The above diagram shows offsets and occupied space, the layout is much like a
hex editor. But why is the layout like that? Given our alignment requirements,
we pack our members into memory in the order they are in the source code. All
we know is that the starting address is divisible by 8, and the *size* has to
be as well. Why? Because we might want to put our structures in an array or a
dynamically allocated chunk of memory, and a common way to achieve that is:
```C
some_type_name_t* ptr = malloc(n * sizeof(some_type_name_t));
```
Now if the size isn't padded to fit this requirement, we can't fit n elements
into our array while honouring alignment.

This leaves us with the following simple algorithm to determine the memory
layout of an arbitrary structure:
```
1. determine the alignment of all members
2. set the alignment of the struct to the maximum of the list determined in 1.
3. place all members consecutively into memory, padding with unused bytes to
   fit the alignment requirements. 
4. pad the entire struct to make the size of it divisible by it's alignment.
```

A similar approach is needed when dealing with unions. Their size is simply the
size of their largest element, and their alignment is the maximal alignment of
their elements.

### Example
As an example, let's consider some structs from capstone:
```C
// Instruction operand
typedef struct cs_arm_op {
  int vector_index; // Vector Index for some vector operands (or -1 if irrelevant)
  struct {
    arm_shifter type;
    unsigned int value;
  } shift;
  arm_op_type type; // operand type
  union {
    unsigned int reg; // register value for REG/SYSREG operand
    int32_t imm;      // immediate value for C-IMM, P-IMM or IMM operand
    double fp;      // floating point value for FP operand
    arm_op_mem mem;   // base/index/scale/disp value for MEM operand
    arm_setend_type setend; // SETEND instruction's operand type
  };
  // in some instructions, an operand can be subtracted or added to
  // the base register,
  bool subtracted; // if TRUE, this operand is subtracted. otherwise, it is added.
} cs_arm_op;
```
And some code to check the sizes and offsets:
```C
/* An attempt to map all struct sizes to account for the shitty C11 support
 * C2HS exposes. We just print them in a structured fashion to account for
 *  * the anonymous unions present in most of the code. That way, currently
 *   * broken Storable instances can be fixed. - This is what happens when you
 *    * start writing proper property-based tests ;)

#include <stdio.h>

#include <capstone/arm.h>

// print all struct sizes
void print_sizes(void){
    puts("arm.h");
    printf("[*] arm_op_mem: %d\n", sizeof(arm_op_mem));
    printf("[*] cs_arm_op: %d\n", sizeof(cs_arm_op));
    printf("[*] cs_arm: %d\n", sizeof(cs_arm));
}

// print all offsets and member sizes
void print_alignment(void){
    cs_arm_op test = {0, {1, 2}, 3, 4};
    void *base = &test;

    printf("cs_arm_op: %d\n", sizeof(cs_arm_op));
    puts("cs_arm_op\toffset\tsize");
    printf("vector_index:\t%d\t%d\n", (void *)&test.vector_index - base,
            sizeof(int));
    printf("shift.type:\t%d\t%d\n", (void *)&test.shift.type - base,
            sizeof(arm_shifter));
    printf("shift.value:\t%d\t%d\n", (void *)&test.shift.value - base,
            sizeof(unsigned int));
    printf("type:\t\t%d\t%d\n", (void *)&test.type - base,
            sizeof(arm_op_type));
    printf("union.reg:\t%d\t%d\n", (void *)&test.reg - base,
            sizeof(unsigned int));
    printf("union.imm:\t%d\t%d\n", (void *)&test.imm - base,
            sizeof(int32_t));
    printf("union.fp:\t%d\t%d\n", (void *)&test.fp - base,
            sizeof(double));
    printf("union.mem:\t%d\t%d\n", (void *)&test.mem - base,
            sizeof(arm_op_mem));
    printf("union.setend:\t%d\t%d\n", (void *)&test.setend - base,
            sizeof(arm_setend_type));
    printf("subtracted:\t%d\t%d\n", (void *)&test.subtracted - base,
            sizeof(bool));
}

int main(void){
    print_sizes();
    print_alignment();

    return 0;
}
```
Compile with `gcc arm_test.c -lcapstone -o arm_test` and observe.
I still need to verify this approach on other architectures and with different
compilers, but I am confident that it will work out and make it possible to
write cross-platform bindings that work and circumvent the limitations of
`c2hs`.

## Conclusion
Given these rules and guidelines, it should be possible to do two things:

1. write structures in a way that takes up less memory (Eric S. Raymonds wrote
   a great article on that topic [here](http://www.catb.org/esr/structure-packing/).
2. determine the offsets of all members in a struct in more or less
   cross-platform fashion, which is our usecase as we need those values when
   writing `Storable` instances for Haskell datatypes that match C structures.

## Why we need this *here*
> But wait, doesn't `c2hs` handle this for us?

Sadly, that's the culprit. If you need to handle C11-specific things like
anonymous unions, you can't rely on `c2hs`. Instead, you need to do what it
does behind the scenes: write calls like this, because the header parsing
gets hickups:
```Haskell
peekByteOff p 8
```
Also, for some reason, `c2hs` assumes that a `bool` from `stdbool.h` gets
stored in a 4-byte word. Very interesting. In this case it proved useful to
have good property-based tests (provided by QuickCheck) that check the `peek`
and `poke` implementations of my types.

That's it for now.
