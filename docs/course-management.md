# Course management

The expand action on a course opens `/workspace/courses/$courseId`. Modules is the default horizontal tab; General, Videos, Learners, Reviews, and Settings complete the workspace.

- General edits draft course details and uploads a thumbnail using the existing Cloudinary file-picker flow.
- Modules creates, edits, archives, and reorders modules and lessons, moves lessons between modules, and manages assessment questions. Modules and lessons collapse independently; drag handles support pointer and keyboard reordering, with menu controls as a fallback. Lesson types are text, video lesson, assessment, and video submission prompt.
- Videos shows linked video lessons grouped by their module placement. Uploading creates a video lesson in the chosen module after transfer; an attachment failure retains the library video and can be retried. Existing library videos can also be attached in a lesson editor.
- Learners lists enrollments with authoritative totals, shows current progress and historical completion, and displays certificate verification. Administrators can assign active learners to published courses and revoke an issued certificate with a reason.
- Reviews grades short answers and approves or requests revisions for learner videos. The queues contain pending reviews for this course only.
- Settings handles certificates, draft ownership assignment, publishing, returning to draft, and archiving.

Video, learner, and owner pickers share a searchable combobox. Empty assessments use the shared table-style empty state with an Add question action. Course refresh is an accessible icon-only button.

Settings sections span the content width, with lifecycle and certificate actions beside their explanatory content on desktop. The breadcrumb shows the current course title and links back to Courses while preserving library search and pagination.

Course owners and administrators can author draft content; published and archived content is read-only. Non-owning instructors cannot manage enrollments or reviews. Server authorization remains authoritative.

The URL stores `tab`, `courseQ`, `module`, `coursePage`, `coursePageSize`, `reviewType`, `action`, `moduleId`, `lessonId`, and `selection`. Parent library search, filters, and pagination are kept separately and restored by Back to courses. Closing a dialog preserves tab and table state.

Learner and review pagination uses `courseEnrollmentsPage`, `assessmentReviewQueuePage`, and `videoSubmissionReviewQueuePage`. The existing list queries remain compatible. Deploy the updated backend GraphQL schema with this frontend. No new database migration is required for the management tabs.

Verification includes frontend and backend tests, generated GraphQL documents, typechecks, lint, and production builds. Browser rendering, native file selection, and live Cloudinary/Bunny transfer and playback require a browser/provider smoke check.
