---
id: 1
title: create-robotics-constitution
stage: constitution
date: 2025-12-09
surface: agent
model: Qwen
feature: none
branch: main
user: wahaj-ali
command: /sp.constitution
labels: ["constitution", "robotics", "ai", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /home/wahaj-ali/Desktop/book/Physical-AI-Humanoid-Robotic/.specify/memory/constitution.md
 - /home/wahaj-ali/Desktop/book/Physical-AI-Humanoid-Robotic/.specify/templates/plan-template.md
 - /home/wahaj-ali/Desktop/book/Physical-AI-Humanoid-Robotic/.specify/templates/spec-template.md
 - /home/wahaj-ali/Desktop/book/Physical-AI-Humanoid-Robotic/.specify/templates/tasks-template.md
tests:
 - none
---

## Prompt

Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync

---

description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`. This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

Follow this execution flow:

1. Load the existing constitution template at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type ambiguous, propose reasoning before finalizing.

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained template slots that the project has chosen not to define yet—explicitly justify any left).
   - Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
   - Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.

4. Consistency propagation checklist (convert prior checklist into active validations):
   - Read `.specify/templates/plan-template.md` and ensure any "Constitution Check" or rules align with updated principles.
   - Read `.specify/templates/spec-template.md` for scope/requirements alignment—update if constitution adds/removes mandatory sections or constraints.
   - Read `.specify/templates/tasks-template.md` and ensure task categorization reflects new or removed principle-driven task types (e.g., observability, versioning, testing discipline).
   - Read each command file in `.specify/templates/commands/*.md` (including this one) to verify no outdated references (agent-specific names like CLAUDE only) remain when generic guidance is required.
   - Read any runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`, or agent-specific guidance files if present). Update references to principles changed.

5. Produce a Sync Impact Report (prepend as an HTML comment at top of the constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred.

6. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

7. Write the completed constitution back to `.specify/memory/constitution.md` (overwrite).

8. Output a final summary to the user with:
   - New version and bump rationale.
   - Any files flagged for manual follow-up.
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally) but do not hard enforce with awkward breaks.
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report under deferred items.

Do not create a new template; always operate on the existing `.specify/memory/constitution.md` file.

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.


/sp.constitution Act as:
A Robotics Architect + AI Safety Researcher + ROS 2 Engineer + NVIDIA Isaac Expert + Constitutional Technical Writer.

Task:
Create a Constitution for my project Physical-AI-Humanoid-Robotic a humanoid robotics system using ROS 2, Gazebo, Unity, NVIDIA Isaac, and Vision-Language-Action AI.

Project Context

Use these modules as constitutional pillars:

Module 1: ROS 2 Nervous System
Nodes, Topics, Services, rclpy bridges, URDF for humanoid structure.

Module 2: Digital Twin (Gazebo & Unity)
Physics simulation, collisions, gravity, high-fidelity rendering, sensor simulation (LiDAR, Depth, IMU).

Module 3: AI-Robot Brain (NVIDIA Isaac)
Isaac Sim data generation, Isaac ROS (VSLAM), Nav2 for humanoid navigation.

Module 4: Vision-Language-Action (VLA)
Whisper for voice commands, LLM-based cognitive planning, full autonomous humanoid pipeline.

Output Requirements:

Create a formal and structured Constitution containing:

Preamble vision and purpose

Core Principles safety, ethics, autonomy limits, transparency

System Governance communication rules, data rules, human override

Operational Policies navigation, manipulation, perception, fail-safes

Technical Articles ROS 2, Digital Twin, Isaac, VLA

Safety & Ethics Charter prohibited actions, safety layers

Future Expansion Guidelines scaling, cloud robotics, deployment

Style:

Write in clear, formal, constitutional language, suitable for a high-integrity robotics system.

## Response snapshot

I've successfully created a comprehensive constitution for your Physical-AI-Humanoid-Robotic project. The constitution includes:

**Preamble**: Establishing the fundamental principles and governance framework for the humanoid robotics system.

**Core Principles**:
1. Safety-First Design: All system components must prioritize human safety and environmental protection above all other considerations
2. Modular Architecture: Components designed as independent modules with well-defined interfaces
3. Deterministic Communication: ROS 2 communication with guaranteed message delivery where safety-critical
4. AI Transparency: AI decision-making processes must be interpretable and traceable
5. Simulation-to-Reality Transfer: All behaviors validated in simulation before real-world deployment
6. Human-in-the-Loop Override: Humans retain ultimate authority over all robotic operations

**Technical Architecture Requirements**: Specifying the use of ROS 2 for communication, Digital Twin technology (Gazebo/Unity), NVIDIA Isaac for navigation, and VLA system components.

**Operational Policies**: Guidelines for safe autonomous operations, navigation, manipulation, and fail-safe procedures.

**Safety & Ethics Charter**: Guidelines for prohibited actions, safety layers, and ethical considerations.

**Future Expansion Guidelines**: Principles for scaling, cloud robotics integration, and deployment.

**Governance**: Amendment procedures, versioning policies, and compliance review expectations.

I've also updated all dependent templates to align with the new constitution:
- `.specify/templates/plan-template.md`: Added constitution check section referencing the core principles
- `.specify/templates/spec-template.md`: Added notes about safety implications and constitutional compliance
- `.specify/templates/tasks-template.md`: Added compliance verification task and constitutional notes

The constitution file has been written to `.specify/memory/constitution.md` with version 1.0.0, and includes a Sync Impact Report at the top.

## Outcome

- ✅ Impact: Created a comprehensive constitution for the Physical-AI-Humanoid-Robotic project with all required components
- 🧪 Tests: none
- 📁 Files: 4 files updated (.specify/memory/constitution.md, .specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md)
- 🔁 Next prompts: none
- 🧠 Reflection: The constitution properly addresses all required aspects for a humanoid robotics system with safety, ethics, and technical governance

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none