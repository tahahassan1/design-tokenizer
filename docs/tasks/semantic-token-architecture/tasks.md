## Goal
Upgrade token generation and guidelines output to use semantic surface roles, premium visual benchmarks, and strict structural/component constraints.

## Files expected to change
- lib/types.ts — define semantic token roles in raw and final token contracts.
- lib/referencesIndex.ts — map styles and industries to premium visual benchmarks.
- lib/llmPrompt.ts — request and validate semantic roles with reference context.
- lib/tokenValidator.ts — build semantic tokens while preserving deterministic safeguards.
- lib/designGuidelines.ts — inject benchmark, structural rules, and Tailwind do/don't patterns.
- docs/tasks/semantic-token-architecture/tasks.md — track this implementation.

## Files explicitly off-limits
- components/ResultView.tsx — preserve existing UI compatibility unless the new output contract requires a direct consumer fix.
- app/api/generate-tokens/route.ts — existing orchestration should remain unchanged.

## Acceptance criteria
- [x] Generated tokens expose `surface-base`, `surface-container`, `border-subtle`, `interactive-accent`, `text-primary`, and `text-muted`.
- [x] Guidelines include a Visual Benchmark section with style/industry references.
- [x] Guidelines include strict typography, spacing, padding, and component-pattern constraints with Tailwind snippets.
- [x] Existing TypeScript/build checks pass.

## Approach
Add a typed reference dictionary with style fallback and optional industry refinement. Replace the LLM color request with semantic roles, derive compatibility color scales deterministically from those roles, and extend the current guidelines formatter with benchmark and anti-generic UI rules.
