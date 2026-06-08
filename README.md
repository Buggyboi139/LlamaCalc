# Llama Command Bench

A static Linux-first llama.cpp command builder and benchmark logger.

The app builds `llama-server` and `llama-cli` commands, groups flags by category, persists the current browser state, and logs real benchmark results from pasted llama.cpp timing output.

## Scope

- Linux only
- Static HTML, CSS, and JavaScript
- No backend
- No named profiles
- No TPS estimates
- No VRAM estimates
- No hardware guessing
- Browser persistence for builder state and benchmark logs only

## Files

- `index.html`: App shell, command output, builder mount, and benchmark log UI.
- `style.css`: Dark responsive interface.
- `script.js`: Field catalogue, command generator, localStorage state, timing parser, and benchmark log logic.

## Removed idea

The old calculator tried to infer runtime memory, GPU offload, and tokens per second. That path was deleted on purpose. This app now focuses on reproducible command generation and real benchmark logging.
