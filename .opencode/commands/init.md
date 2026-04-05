---
description: Strict repo initialization
---

Analyze this repository and create or update ./AGENTS.md.

Goal:
Produce a compact, repo-specific AGENTS.md that helps coding agents make correct decisions in this repository without guesswork.

Required analysis:

- Inspect package manager files, workspace config, package scripts, build/test/lint configs, docs, and the main source tree.
- If AGENTS.md already exists, validate it against the current repository and improve it in place.

Hard constraints:

- Do not invent commands, paths, workflows, environments, conventions, or architecture details.
- Never include absolute local filesystem paths.
- Do not include generic software advice, general TypeScript advice, or obvious monorepo advice.
- Do not include facts that are already trivial from package.json or file names unless they change agent decisions.
- Prefer short, dense bullets over explanatory prose.
- Keep the file compact. Target roughly 50–100 lines unless the repository clearly needs more.

Output format:
Return only the final AGENTS.md content.

Target structure:

# AGENTS.md

## Project Purpose and Stack

Summarize only the repo-specific essentials:

- what this workspace is
- what the main packages do
- what major tooling shapes the workflow
- any architectural fact that would change implementation decisions

## Commands That Work Here

Rules for this section:

- Group commands by scope when needed, but keep the section short.
- Include repo-root commands that are real entrypoints.
- Include package-level commands only when the corresponding package.json actually defines them.
- Do not overfocus on one package unless it is truly the only package with runnable local scripts.
- Do not include ultra-specific per-test-file commands or cookbook-style command recipes.
- Keep this section to runnable entrypoints only, not commentary.

## Repo Structure

Include only non-obvious locations that matter for navigation or edits:

- runtime entrypoints

## Conventions and Boundaries

Include only rules that an agent could violate by accident:

- public export rules
- package boundary rules
- important codestyle
- tsconfig/build assumptions if they affect edits
- anything repo-specific that should not be “simplified away”

## Validation Workflow

Make this policy-style, not cookbook-style:

- explain the normal validation order after changes
- use repo-root validation when changes affect exports, workspace wiring, shared config, or cross-package behavior
- do not duplicate generic pnpm/vitest knowledge that a tool skill would already cover

Section selection rule:
Only include a section or bullet if it answers at least one of these:

- What wrong decision would an agent make without this?
- What could be broken if this repo-specific fact is missed?
- What is not obvious from quickly reading package.json or file names?

Exclusion rule:
Remove anything that is merely descriptive, generic, redundant, or recoverable instantly from the repo without loss of decision quality.

Specific preferences for this repository shape:

- Prefer a short Project Purpose and Stack section.
- Keep Commands That Work Here as entrypoints, not as a script dump.
- Keep Repo Structure focused on actual editing/navigation hotspots.
- Keep Conventions and Boundaries strong and explicit.
- Keep Validation Workflow practical and repo-specific.

Before finalizing:

- Verify that every referenced command exists.
- Verify that every referenced path exists.
- Remove generic, duplicated, or low-signal bullets.
- Optimize for future coding-agent sessions, not for human onboarding completeness.
- If a detail is uncertain or not verified from the repo, omit it.
