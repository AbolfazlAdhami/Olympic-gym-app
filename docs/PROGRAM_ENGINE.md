# Training Program Engine

## Design principle
The program engine is deterministic, explainable, testable, and separate from the LLM. AI can explain, help personalize, or propose; domain logic validates and controls program output.

## Inputs
- Goal: hypertrophy, strength, fat loss while maintaining strength/muscle, general fitness, recomposition (supported list to be reviewed).
- Experience: beginner/intermediate/advanced; also consider consistency and technique readiness.
- Available days and preferred schedule.
- Session duration.
- Equipment access.
- Exercise preferences and exclusions.
- Limitations or movements user reports as painful (do not diagnose).
- Muscle priorities (optional).
- Recent adherence/performance when available.

## Outputs
- Program name, goal, schedule, duration or review period.
- Program days and exercise order.
- Exercise ID, sets, rep range, rest, target RIR, notes.
- Progression policy.
- Explanation and customization options.
- Program version.

## Engine stages
1. Validate profile.
2. Select split template appropriate to days, experience, time, and recovery.
3. Allocate training frequency across muscle groups.
4. Set initial volume targets using conservative configurable ranges.
5. Select exercises from published catalog based on muscle, movement pattern, equipment, preferences, and limitations.
6. Avoid excessive redundancy and manage fatigue.
7. Set rep ranges, sets, rest, and target effort.
8. Estimate workout duration; adjust exercise count.
9. Validate weekly volume, movement coverage, schedule, IDs, constraints, and workload.
10. Generate explanation and user-editable plan.
11. Save draft; user approves/activates.

## Programming principles
- Use conservative, configurable defaults; avoid universal one-size-fits-all volume prescriptions.
- Full-body, upper/lower, push-pull-legs, and other splits are templates, not dogma.
- Balance movement patterns and muscle groups.
- Do not prescribe every set to failure by default.
- Include warm-up guidance; do not count warm-up sets as working volume unless explicitly defined.
- Consider session duration.
- Include rest recommendations by exercise/effort.
- Provide alternatives for equipment constraints.
- Avoid training through reported pain; recommend qualified professional evaluation when appropriate.
- User can edit or reject recommendations.
- Program changes require explanation and user control.

## Volume calculation
Define a documented method. Initially count direct working sets for the target muscle. Secondary-muscle contribution can be modeled separately (e.g. fractional weighting) only after deciding and documenting methodology; avoid implying the estimate is exact physiology. Exclude warm-up sets by default.

## Progression
Double progression may be used:
- Keep exercise, load, and rep range.
- Add reps within range while maintaining acceptable technique and effort.
- Increase load by a small practical increment when criteria are met.
- Reset reps toward the lower end after load increase.
- If performance regresses repeatedly, evaluate adherence, fatigue, rest, recovery, and program volume; don't automatically make aggressive changes.

## Safety and validation
- Exercise ID exists and is published.
- Equipment matches user access or approved alternative.
- Schedule is valid.
- No incompatible reported restrictions.
- Session duration estimate within tolerance.
- Sets/reps/rest/effort values in configurable acceptable ranges.
- No unsafe or nonsensical duplicates.
- User review and consent before activation.
