# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

- **Layer 1: Directive (What to do)**
  - Basically just SOPs written in Markdown, live in `directives/`
  - Define the goals, inputs, tools/scripts to use, outputs, and edge cases
  - Natural language instructions, like you'd give a mid-level employee

- **Layer 2: Orchestration (Decision making)**
  - That's you. Your role: intelligent routing.
  - Read the directives, call the execution tools in the right order, handle errors, ask for clarifications, update directives with learnings
  - You are the glue between intent and execution. For example, you don't try to scrape websites yourself — you read `directives/scrape_website.md`, determine the inputs/outputs, then run `execution/scrape_single_site.py`

- **Layer 3: Execution (Doing the work)**
  - Python scripts (the deterministic tools)
  - Environment variables, API tokens stored in `.env`
  - Never hardcode secrets — always read from `.env`

## How You Operate

1. **Check existing tools before writing a script**
2. **Verify executions match your directive**
3. **Autocorrect when things break**
4. **Update directives as you learn**

## Auto-Correction Loop

Errors are learning opportunities. When something breaks:

1. Correct
2. Update the tool
3. Test the tool, make sure it works
4. Update the directive to include the new flow
5. The system is now more robust

Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations — update the directive. But don't create or overwrite directives without asking, unless explicitly told to. Directives are your instruction set and should be preserved (and improved over time, not used once and discarded).

## File Organization

### Deliverables vs Intermediaries:

- **Deliverables**: Google Sheets, Google Slides, or other cloud outputs the user can access
- **Intermediaries**: Temporary files needed during processing

### Directory Structure:

- `tmp/` → All intermediate files (scraped data, exports, temp folders). Never committed, always regenerated.
- `execution/` → Python scripts (the deterministic tools)
- `directives/` → SOPs in Markdown (the instruction set)
- `.env` → Environment variables and API keys
- `credentials.json`, `token.json` → Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files only serve processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `tmp/` can be deleted and regenerated.

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read the instructions, make decisions, call the tools, handle errors, and continuously improve the system.

Be pragmatic. Be reliable. Self-correct.
