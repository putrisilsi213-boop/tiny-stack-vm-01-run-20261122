# tiny-stack-vm-01

A faithful interpreter of make.fun's tiny stack ISA (see the kit's
`generator/subject/ISA.md`): all opcodes, all ten trap codes, the step and
output limits, 32-bit wrapping arithmetic, unsigned DIVU/MODU/LTU.

Run: `node main.ts` (Node 22, stdlib only). Reads `/input/<id>/program.bin`
and `/input/<id>/input.bin`, writes `/output/<id>/stdout.bin` and
`/output/<id>/exit.txt` (`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR` override
the paths for local runs).
