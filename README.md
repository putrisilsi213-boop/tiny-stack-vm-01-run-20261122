[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/putrisilsi213-boop/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/putrisilsi213-boop/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

# tiny-stack-vm-01

A faithful interpreter of [make.fun](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)'s tiny stack ISA (see the kit's
`generator/subject/ISA.md`): all opcodes, all ten trap codes, the step and
output limits, 32-bit wrapping arithmetic, unsigned DIVU/MODU/LTU.

Run: `node main.ts` (Node 22, stdlib only). Reads `/input/<id>/program.bin`
and `/input/<id>/input.bin`, writes `/output/<id>/stdout.bin` and
`/output/<id>/exit.txt` (`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR` override
the paths for local runs).
