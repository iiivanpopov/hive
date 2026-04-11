---
description: Custom project initialization to generate a strictly optimized AGENTS.md
agent: build
---

Analyze the repository and generate a concise `AGENTS.md` file in the project root. Follow these technical requirements strictly:

### 1. Information to INCLUDE

- **Build & Test Commands:** Specific scripts (e.g., `bun run ...`, `vitest`) that cannot be guessed.
- **Non-Standard Code Style:** Only if it deviates from language defaults (e.g., specific import patterns, functional vs. OOP constraints).
- **Unique Architecture:** High-level structure specific to this project (e.g., monorepo workspace logic, custom internal layers).
- **Testing Protocol:** Specific instructions for running focused tests vs. full suites.
- **Git Conventions:** Branch naming patterns and commit formats (e.g., Conventional Commits).
- **Environment Context:** Required variables, dev-environment quirks, and specific setup steps.
- **"Gotchas":** Non-obvious pitfalls that aren't apparent from reading the code.

### 2. Information to EXCLUDE

- **Self-Evident Context:** Anything you can understand by reading the file tree or code.
- **Standard Language Rules:** Do not explain TypeScript or React basics; the model already knows them.
- **Detailed API Docs:** Provide external links instead of embedding full documentation.
- **Volatile Info:** Frequently changing details that will quickly become outdated.
- **File Manifest:** Do not describe every file; focus on the "why" and "how" of the system.
- **Generic Platitudes:** Never include "write clean code" or "be efficient."

### 3. Constraints

- **Length:** The final `AGENTS.md` must be under **150 lines**.
- **Tone:** Technical, dense, and descriptive.
- **Existing Files:** If an `AGENTS.md` or `CLAUDE.md` exists, improve it by pruning fluff and adding missing technical constraints according to this plan.
