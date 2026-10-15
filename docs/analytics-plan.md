# Internal-training analytics

## Implemented

Analytics is available under Workspace. The backend resolves the account's current database role: administrators see all non-archived courses; instructors see only their own courses. Disabled learners are excluded. A foreign or archived course filter is rejected before learning data is queried.

The page uses the shared Noma-style date-range picker (presets, calendar, Apply/Cancel), a course selector, and refresh. Date range, course selection, and follow-up pagination are stored in the URL. The removed page heading, subtitle, and long filter note stay removed.

Charts use white card surfaces, quiet gray borders, blue accents, spacious padding, and shared empty states. Each SVG chart has an accessible name and exact-data disclosure.

| Question | Representation |
| --- | --- |
| Are learners completing their courses? | Progress donut: completed, in progress, not started |
| How is learning progressing over time? | Daily enrollment/completion line chart |
| Are course completion and understanding aligned? | Course scatter plot: completion versus first-attempt pass rate |
| How are assessment scores distributed? | Normalized score histogram |
| Which courses need attention? | Ranked completion bars with cohort denominators and course drill-down |
| Where in a course is progress low? | Curriculum-ordered activity completion columns |
| Which questions need attention? | Question-version × attempt-number difficulty heatmap |
| Are retries helping? | Cumulative assessment pass-rate line chart |
| What needs review? | Pending review-type donut and assessment waiting-time columns |
| Who needs follow-up? | Paginated learner table with course-enrollment links |

## Metric definitions

- Progress and follow-up use enrollments **created during the selected date range**, evaluated in their **current** state. They are not historical snapshots.
- Unique learners and enrollments are distinct counts. Completion percentage is completed enrollments divided by all enrollments in that cohort.
- Started means recorded activity/progress, an assessment attempt, a video submission, or course completion—not merely enrollment.
- Throughput counts enrollments created and completions recorded during the period. Earlier enrollments may complete in that period; throughput completions therefore need not equal cohort completions.
- Assessment outcome charts use attempts graded during the selected period. First-attempt pass rates use attempt number 1 only; ungraded attempts are excluded. Scores are normalized by the attempt's frozen maximum score.
- Retry analysis follows assessment/enrollment pairs whose first attempt was graded during the period. It uses the same denominator at each attempt and counts whether they passed by that attempt, up to attempt 10.
- Question difficulty means answers below full credit, including partial credit. Frozen question snapshots are grouped separately by version. The heatmap shows up to 12 versions from the top 100 version/attempt combinations; the disclosure includes all returned combinations.
- Review queues are current snapshots for the course scope, regardless of the date filter. Only ready videos are included. Assessment waiting time starts at submission.
- Follow-up signals are not started, awaiting review, latest submission requiring revision, and latest failed assessment attempt. These are not inactivity or overdue claims.
- Undefined rates are null, not fabricated 0%. Genuine zero-result rates with a nonzero denominator remain visible.
- Dates use inclusive UTC calendar days, implemented as a start-inclusive/end-exclusive interval. The selected range is limited to 366 days.

## Deliberately not implemented

Team/department comparisons require reliable team membership. Required-training compliance and overdue reports require assignments and due dates. None is inferred from ordinary enrollment.

Daily engagement/inactivity requires activity events. Video review age requires a reliable ready-for-review timestamp. Invitation conversion is not a core internal-training outcome and is excluded.

No migration or provider credentials are needed for the implemented reports.

## Verification

The backend unit suite checks filter validation and query scoping. PostgreSQL integration tests opt into `ANALYTICS_TEST_DATABASE_URL` and create session-local temporary copies of the relevant tables; no persistent application data is modified. They check actual aggregates, normalized scores, retry denominators, question versions, UTC boundaries in a non-UTC session, roles, empty cohorts, pagination, and GraphQL serialization.

Frontend tests cover URL filters, inclusive date presets, calendar round-trips, real GraphQL query variables, cache boundaries, removed copy, chart variation, exact denominators, and proper zero/empty states. Browser visual and interactive verification must be performed separately; static rendering is not browser proof.
