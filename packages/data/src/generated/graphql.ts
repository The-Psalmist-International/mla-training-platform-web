import type { TypedDocumentNode as DocumentNode } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AcceptInvitationInput = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type AssessmentAnswerInput = {
  questionId: Scalars['ID']['input'];
  selectedOptionId?: InputMaybe<Scalars['ID']['input']>;
  textAnswer?: InputMaybe<Scalars['String']['input']>;
};

export type AssessmentAttempt = {
  answers: Array<AttemptAnswer>;
  assessmentId: Scalars['ID']['output'];
  assessmentTitle: Scalars['String']['output'];
  attemptLimit: Maybe<Scalars['Int']['output']>;
  attemptNumber: Scalars['Int']['output'];
  deadlineAt: Maybe<Scalars['String']['output']>;
  enrollmentId: Scalars['ID']['output'];
  gradedAt: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxScore: Scalars['Int']['output'];
  passMark: Scalars['Int']['output'];
  passed: Maybe<Scalars['Boolean']['output']>;
  score: Maybe<Scalars['Float']['output']>;
  startedAt: Scalars['String']['output'];
  status: AssessmentAttemptStatus;
  submittedAt: Maybe<Scalars['String']['output']>;
  timeLimitSeconds: Maybe<Scalars['Int']['output']>;
  version: Scalars['Int']['output'];
};

export type AssessmentAttemptStatus =
  | 'graded'
  | 'in_progress'
  | 'needs_grading';

export type AssessmentAttemptSummary = {
  assessmentId: Scalars['ID']['output'];
  assessmentTitle: Scalars['String']['output'];
  attemptLimit: Maybe<Scalars['Int']['output']>;
  attemptNumber: Scalars['Int']['output'];
  deadlineAt: Maybe<Scalars['String']['output']>;
  enrollmentId: Scalars['ID']['output'];
  gradedAt: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxScore: Scalars['Int']['output'];
  passMark: Scalars['Int']['output'];
  passed: Maybe<Scalars['Boolean']['output']>;
  score: Maybe<Scalars['Float']['output']>;
  startedAt: Scalars['String']['output'];
  status: AssessmentAttemptStatus;
  submittedAt: Maybe<Scalars['String']['output']>;
  timeLimitSeconds: Maybe<Scalars['Int']['output']>;
  version: Scalars['Int']['output'];
};

export type AssessmentReviewEntry = {
  assessmentId: Scalars['ID']['output'];
  assessmentTitle: Scalars['String']['output'];
  attemptNumber: Scalars['Int']['output'];
  enrollmentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  learnerName: Scalars['String']['output'];
  status: AssessmentAttemptStatus;
  submittedAt: Scalars['String']['output'];
};

export type AttemptAnswer = {
  awardedPoints: Maybe<Scalars['Float']['output']>;
  explanation: Maybe<Scalars['String']['output']>;
  feedback: Maybe<Scalars['String']['output']>;
  question: AttemptQuestion;
  referenceAnswer: Maybe<Scalars['String']['output']>;
  selectedOptionId: Maybe<Scalars['ID']['output']>;
  textAnswer: Maybe<Scalars['String']['output']>;
};

export type AttemptOption = {
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

export type AttemptQuestion = {
  id: Scalars['ID']['output'];
  options: Array<AttemptOption>;
  points: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  type: QuestionType;
};

export type AuthPayload = {
  accessToken: Scalars['String']['output'];
  expiresIn: Scalars['Int']['output'];
  user: User;
};

export type AuthoringQuestion = {
  explanation: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  options: Array<AuthoringQuestionOption>;
  points: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  referenceAnswer: Maybe<Scalars['String']['output']>;
  type: QuestionType;
};

export type AuthoringQuestionInput = {
  explanation?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Array<AuthoringQuestionOptionInput>>;
  points?: InputMaybe<Scalars['Int']['input']>;
  prompt: Scalars['String']['input'];
  referenceAnswer?: InputMaybe<Scalars['String']['input']>;
  type: QuestionType;
};

export type AuthoringQuestionOption = {
  id: Scalars['ID']['output'];
  isCorrect: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

export type AuthoringQuestionOptionInput = {
  isCorrect: Scalars['Boolean']['input'];
  label: Scalars['String']['input'];
};

export type CatalogAssessment = {
  attemptLimit: Maybe<Scalars['Int']['output']>;
  passMark: Scalars['Int']['output'];
  /** Author-only. Learner attempt questions will be served by the learning API. */
  questions: Maybe<Array<AuthoringQuestion>>;
  timeLimitSeconds: Maybe<Scalars['Int']['output']>;
};

export type Certificate = {
  certificateNumber: Scalars['String']['output'];
  courseTitle: Scalars['String']['output'];
  enrollmentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  issuedAt: Scalars['String']['output'];
  pdfPath: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  revokedAt: Maybe<Scalars['String']['output']>;
  revokedBy: Maybe<Scalars['ID']['output']>;
  revokedReason: Maybe<Scalars['String']['output']>;
  status: CertificateStatus;
  verificationCode: Scalars['String']['output'];
  verificationUrl: Scalars['String']['output'];
};

export type CertificateStatus =
  | 'revoked'
  | 'valid';

export type CertificateVerification = {
  courseTitle: Scalars['String']['output'];
  issuedAt: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  status: CertificateStatus;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Course = {
  certificateEnabled: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ownerId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['String']['output']>;
  status: CourseStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CourseDetail = {
  certificateEnabled: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modules: Array<CourseModule>;
  ownerId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['String']['output']>;
  status: CourseStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CourseEnrollment = {
  completedAt: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerName: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type CourseItem = {
  assessment: Maybe<CatalogAssessment>;
  body: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  moduleId: Scalars['ID']['output'];
  position: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: CourseItemType;
  videoLesson: Maybe<VideoLesson>;
  videoPrompt: Maybe<VideoPrompt>;
};

export type CourseItemType =
  | 'assessment'
  | 'text'
  | 'video_lesson'
  | 'video_prompt';

export type CourseModule = {
  courseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  items: Array<CourseItem>;
  position: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type CourseModuleInput = {
  title: Scalars['String']['input'];
};

export type CourseOutline = {
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  modules: Array<CourseOutlineModule>;
  status: CourseStatus;
  title: Scalars['String']['output'];
};

export type CourseOutlineItem = {
  id: Scalars['ID']['output'];
  position: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: CourseItemType;
};

export type CourseOutlineModule = {
  id: Scalars['ID']['output'];
  items: Array<CourseOutlineItem>;
  position: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type CourseStatus =
  | 'archived'
  | 'draft'
  | 'published';

export type CreateAssessmentInput = {
  attemptLimit?: InputMaybe<Scalars['Int']['input']>;
  passMark?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  timeLimitSeconds?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type CreateCourseInput = {
  certificateEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateInvitationInput = {
  email: Scalars['String']['input'];
  role: UserRole;
};

export type CreateTextLessonInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type CreateVideoLessonInput = {
  completionThreshold?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
  videoAssetId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateVideoPromptInput = {
  instructions?: InputMaybe<Scalars['String']['input']>;
  maxDurationSeconds?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  requiresReview?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type EmailDelivery = {
  bouncedAt: Maybe<Scalars['String']['output']>;
  complainedAt: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  deliveredAt: Maybe<Scalars['String']['output']>;
  failureCode: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notificationId: Maybe<Scalars['ID']['output']>;
  providerMessageId: Maybe<Scalars['String']['output']>;
  purpose: Scalars['String']['output'];
  recipient: Scalars['String']['output'];
  sentAt: Maybe<Scalars['String']['output']>;
  status: EmailDeliveryStatus;
};

export type EmailDeliveryStatus =
  | 'bounced'
  | 'complained'
  | 'delivered'
  | 'failed'
  | 'pending'
  | 'sent'
  | 'skipped';

export type Enrollment = {
  completedAt: Maybe<Scalars['String']['output']>;
  course: Course;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  enrolledBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type EnrollmentDetail = {
  completedAt: Maybe<Scalars['String']['output']>;
  course: Course;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  enrolledBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  progress: Array<ItemProgress>;
  userId: Scalars['ID']['output'];
};

export type GradeAssessmentAttemptInput = {
  attemptId: Scalars['ID']['input'];
  grades: Array<ShortAnswerGradeInput>;
};

export type Invitation = {
  acceptedAt: Maybe<Scalars['String']['output']>;
  acceptedBy: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invitedBy: Scalars['ID']['output'];
  revokedAt: Maybe<Scalars['String']['output']>;
  role: UserRole;
};

export type ItemProgress = {
  completedAt: Maybe<Scalars['String']['output']>;
  itemId: Scalars['ID']['output'];
  resumePositionSeconds: Scalars['Int']['output'];
  status: ItemProgressStatus;
  updatedAt: Scalars['String']['output'];
  watchedPercentage: Scalars['Float']['output'];
};

export type ItemProgressStatus =
  | 'completed'
  | 'in_progress'
  | 'not_started';

export type LessonVideoAsset = {
  durationSeconds: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  status: VideoAssetStatus;
};

export type LessonVideoUploadInput = {
  mimeType: Scalars['String']['input'];
  requestKey: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  acceptInvitation: AuthPayload;
  archiveCourse: CourseDetail;
  archiveCourseItem: CourseDetail;
  archiveCourseModule: CourseDetail;
  assignCourse: Enrollment;
  assignCourseOwner: CourseDetail;
  changePassword: Scalars['Boolean']['output'];
  completeTextLesson: ItemProgress;
  createAssessment: CourseDetail;
  createCourse: Course;
  createCourseModule: CourseDetail;
  createInvitation: Invitation;
  createLessonVideoUpload: VideoUpload;
  createTextLesson: CourseDetail;
  createVideoLesson: CourseDetail;
  createVideoPrompt: CourseDetail;
  enrollInCourse: Enrollment;
  gradeAssessmentAttempt: AssessmentAttempt;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  logoutAll: Scalars['Boolean']['output'];
  markNotificationRead: Notification;
  moveCourseItem: CourseDetail;
  publishCourse: CourseDetail;
  recordVideoProgress: VideoProgressReceipt;
  refreshLessonVideoUpload: VideoUpload;
  refreshSession: AuthPayload;
  refreshVideoSubmissionUpload: VideoSubmissionUpload;
  reorderCourseItems: CourseDetail;
  reorderCourseModules: CourseDetail;
  requestPasswordReset: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  reviewVideoSubmission: VideoSubmission;
  revokeCertificate: Certificate;
  revokeInvitation: Scalars['Boolean']['output'];
  saveAssessmentAnswers: AssessmentAttempt;
  setAssessmentQuestions: CourseDetail;
  setNotificationEmailEnabled: Scalars['Boolean']['output'];
  setUserDisabled: User;
  setUserRole: User;
  startAssessmentAttempt: AssessmentAttempt;
  startVideoProgress: VideoProgressSession;
  startVideoSubmission: VideoSubmissionUpload;
  submitAssessmentAttempt: AssessmentAttempt;
  syncLessonVideoAsset: VideoAsset;
  syncVideoSubmission: VideoSubmission;
  unpublishCourse: CourseDetail;
  updateAssessment: CourseDetail;
  updateCourse: CourseDetail;
  updateCourseModule: CourseDetail;
  updateMyProfile: User;
  updateTextLesson: CourseDetail;
  updateVideoLesson: CourseDetail;
  updateVideoPrompt: CourseDetail;
};


export type MutationAcceptInvitationArgs = {
  input: AcceptInvitationInput;
};


export type MutationArchiveCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveCourseItemArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationArchiveCourseModuleArgs = {
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationAssignCourseArgs = {
  courseId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
};


export type MutationAssignCourseOwnerArgs = {
  id: Scalars['ID']['input'];
  ownerId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCompleteTextLessonArgs = {
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type MutationCreateAssessmentArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateAssessmentInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationCreateCourseArgs = {
  input: CreateCourseInput;
};


export type MutationCreateCourseModuleArgs = {
  courseId: Scalars['ID']['input'];
  input: CourseModuleInput;
};


export type MutationCreateInvitationArgs = {
  input: CreateInvitationInput;
};


export type MutationCreateLessonVideoUploadArgs = {
  input: LessonVideoUploadInput;
};


export type MutationCreateTextLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateTextLessonInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationCreateVideoLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateVideoLessonInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationCreateVideoPromptArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateVideoPromptInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationEnrollInCourseArgs = {
  courseId: Scalars['ID']['input'];
};


export type MutationGradeAssessmentAttemptArgs = {
  input: GradeAssessmentAttemptInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveCourseItemArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
  targetModuleId: Scalars['ID']['input'];
};


export type MutationPublishCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecordVideoProgressArgs = {
  input: RecordVideoProgressInput;
};


export type MutationRefreshLessonVideoUploadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRefreshVideoSubmissionUploadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationReorderCourseItemsArgs = {
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  orderedIds: Array<Scalars['ID']['input']>;
};


export type MutationReorderCourseModulesArgs = {
  courseId: Scalars['ID']['input'];
  orderedIds: Array<Scalars['ID']['input']>;
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationReviewVideoSubmissionArgs = {
  input: ReviewVideoSubmissionInput;
};


export type MutationRevokeCertificateArgs = {
  input: RevokeCertificateInput;
};


export type MutationRevokeInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaveAssessmentAnswersArgs = {
  input: SaveAssessmentAnswersInput;
};


export type MutationSetAssessmentQuestionsArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  questions: Array<AuthoringQuestionInput>;
};


export type MutationSetNotificationEmailEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  type: NotificationType;
};


export type MutationSetUserDisabledArgs = {
  disabled: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};


export type MutationSetUserRoleArgs = {
  id: Scalars['ID']['input'];
  role: UserRole;
};


export type MutationStartAssessmentAttemptArgs = {
  input: StartAssessmentAttemptInput;
};


export type MutationStartVideoProgressArgs = {
  input: StartVideoProgressInput;
};


export type MutationStartVideoSubmissionArgs = {
  input: VideoSubmissionUploadInput;
};


export type MutationSubmitAssessmentAttemptArgs = {
  input: SubmitAssessmentAttemptInput;
};


export type MutationSyncLessonVideoAssetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSyncVideoSubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnpublishCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAssessmentArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateAssessmentInput;
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationUpdateCourseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCourseInput;
};


export type MutationUpdateCourseModuleArgs = {
  courseId: Scalars['ID']['input'];
  input: CourseModuleInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationUpdateMyProfileArgs = {
  name: Scalars['String']['input'];
};


export type MutationUpdateTextLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateTextLessonInput;
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationUpdateVideoLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateVideoLessonInput;
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationUpdateVideoPromptArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateVideoPromptInput;
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};

export type Notification = {
  createdAt: Scalars['String']['output'];
  entityId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  readAt: Maybe<Scalars['String']['output']>;
  type: NotificationType;
};

export type NotificationType =
  | 'assessment_graded'
  | 'certificate_issued'
  | 'course_completed'
  | 'grading_pending'
  | 'submission_pending_review'
  | 'submission_reviewed';

export type Query = {
  adminEmailMessage: EmailDelivery;
  adminEmailMessages: Array<EmailDelivery>;
  assessmentAttempt: AssessmentAttempt;
  assessmentReviewQueue: Array<AssessmentReviewEntry>;
  certificate: Certificate;
  certificateForEnrollment: Maybe<Certificate>;
  course: CourseDetail;
  courseEnrollments: Array<CourseEnrollment>;
  courseOutline: CourseOutline;
  courses: Array<Course>;
  enrollment: EnrollmentDetail;
  health: Scalars['String']['output'];
  invitations: Array<Invitation>;
  lessonPlayback: VideoPlayback;
  me: Maybe<User>;
  myAssessmentAttempts: Array<AssessmentAttemptSummary>;
  myCertificates: Array<Certificate>;
  myEnrollments: Array<Enrollment>;
  myNotificationEmailOptOuts: Array<NotificationType>;
  myNotifications: Array<Notification>;
  myVideoAssets: Array<VideoAsset>;
  myVideoSubmissions: Array<VideoSubmission>;
  previewLessonVideo: VideoPlayback;
  users: Array<User>;
  usersPage: UserPage;
  verifyCertificate: Maybe<CertificateVerification>;
  videoAsset: VideoAsset;
  videoSubmission: VideoSubmission;
  videoSubmissionPlayback: VideoPlayback;
  videoSubmissionReviewQueue: Array<VideoSubmissionReviewEntry>;
};


export type QueryAdminEmailMessageArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminEmailMessagesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EmailDeliveryStatus>;
};


export type QueryAssessmentAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssessmentReviewQueueArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryCertificateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCertificateForEnrollmentArgs = {
  enrollmentId: Scalars['ID']['input'];
};


export type QueryCourseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseEnrollmentsArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryCourseOutlineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCoursesArgs = {
  limit?: Scalars['Int']['input'];
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CourseStatus>;
};


export type QueryEnrollmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvitationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLessonPlaybackArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type QueryMyAssessmentAttemptsArgs = {
  assessmentId: Scalars['ID']['input'];
  enrollmentId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyCertificatesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyEnrollmentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyVideoAssetsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyVideoSubmissionsArgs = {
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryPreviewLessonVideoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUsersPageArgs = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVerifyCertificateArgs = {
  code: Scalars['String']['input'];
};


export type QueryVideoAssetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoSubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoSubmissionPlaybackArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoSubmissionReviewQueueArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'true_false';

export type RecordVideoProgressInput = {
  playing: Scalars['Boolean']['input'];
  positionSeconds: Scalars['Float']['input'];
  sequence: Scalars['Int']['input'];
  sessionId: Scalars['ID']['input'];
};

export type ResetPasswordInput = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ReviewVideoSubmissionInput = {
  decision: VideoSubmissionDecision;
  feedback?: InputMaybe<Scalars['String']['input']>;
  submissionId: Scalars['ID']['input'];
};

export type RevokeCertificateInput = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

export type SaveAssessmentAnswersInput = {
  answers: Array<AssessmentAnswerInput>;
  attemptId: Scalars['ID']['input'];
  expectedVersion: Scalars['Int']['input'];
};

export type ShortAnswerGradeInput = {
  awardedPoints: Scalars['Float']['input'];
  feedback?: InputMaybe<Scalars['String']['input']>;
  questionId: Scalars['ID']['input'];
};

export type StartAssessmentAttemptInput = {
  assessmentId: Scalars['ID']['input'];
  enrollmentId: Scalars['ID']['input'];
};

export type StartVideoProgressInput = {
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  positionSeconds: Scalars['Float']['input'];
};

export type SubmitAssessmentAttemptInput = {
  attemptId: Scalars['ID']['input'];
  expectedVersion: Scalars['Int']['input'];
};

export type UpdateAssessmentInput = {
  attemptLimit?: InputMaybe<Scalars['Int']['input']>;
  passMark?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  timeLimitSeconds?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCourseInput = {
  certificateEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTextLessonInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVideoLessonInput = {
  completionThreshold?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  videoAssetId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateVideoPromptInput = {
  instructions?: InputMaybe<Scalars['String']['input']>;
  maxDurationSeconds?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  requiresReview?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  createdAt: Scalars['String']['output'];
  disabledAt: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  emailVerifiedAt: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: UserRole;
  updatedAt: Scalars['String']['output'];
};

export type UserPage = {
  items: Array<User>;
  totalCount: Scalars['Int']['output'];
};

export type UserRole =
  | 'admin'
  | 'instructor'
  | 'learner';

export type VideoAsset = {
  createdAt: Scalars['String']['output'];
  durationSeconds: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  sizeBytes: Maybe<Scalars['String']['output']>;
  status: VideoAssetStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type VideoAssetStatus =
  | 'failed'
  | 'pending_upload'
  | 'processing'
  | 'ready';

export type VideoLesson = {
  completionThreshold: Scalars['Int']['output'];
  videoAsset: Maybe<LessonVideoAsset>;
  videoAssetId: Maybe<Scalars['ID']['output']>;
};

export type VideoPlayback = {
  expires: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type VideoProgressReceipt = {
  accepted: Scalars['Boolean']['output'];
  buffered: Scalars['Boolean']['output'];
};

export type VideoProgressSession = {
  completionThreshold: Scalars['Int']['output'];
  durationSeconds: Scalars['Int']['output'];
  heartbeatIntervalSeconds: Scalars['Int']['output'];
  sessionId: Scalars['ID']['output'];
};

export type VideoPrompt = {
  instructions: Scalars['String']['output'];
  maxDurationSeconds: Scalars['Int']['output'];
  requiresReview: Scalars['Boolean']['output'];
};

export type VideoSubmission = {
  asset: VideoAsset;
  attemptNumber: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  enrollmentId: Scalars['ID']['output'];
  failureCode: Maybe<Scalars['String']['output']>;
  feedback: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  instructions: Scalars['String']['output'];
  itemId: Scalars['ID']['output'];
  maxDurationSeconds: Scalars['Int']['output'];
  promptTitle: Scalars['String']['output'];
  requiresReview: Scalars['Boolean']['output'];
  reviewedAt: Maybe<Scalars['String']['output']>;
  reviewedBy: Maybe<Scalars['ID']['output']>;
  status: VideoSubmissionStatus;
  updatedAt: Scalars['String']['output'];
};

export type VideoSubmissionDecision =
  | 'approved'
  | 'needs_revision';

export type VideoSubmissionReviewEntry = {
  asset: VideoAsset;
  attemptNumber: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  enrollmentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  itemId: Scalars['ID']['output'];
  learnerName: Scalars['String']['output'];
  promptTitle: Scalars['String']['output'];
  status: VideoSubmissionStatus;
};

export type VideoSubmissionStatus =
  | 'approved'
  | 'failed'
  | 'needs_revision'
  | 'pending_review'
  | 'processing'
  | 'uploading';

export type VideoSubmissionUpload = {
  submission: VideoSubmission;
  upload: VideoUploadTarget;
};

export type VideoSubmissionUploadInput = {
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  mimeType: Scalars['String']['input'];
  requestKey: Scalars['ID']['input'];
};

export type VideoUpload = {
  asset: VideoAsset;
  upload: VideoUploadTarget;
};

export type VideoUploadTarget = {
  endpoint: Scalars['String']['output'];
  expires: Scalars['Int']['output'];
  libraryId: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  videoId: Scalars['ID']['output'];
};

export type AssessmentReviewQueueQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type AssessmentReviewQueueQuery = { assessmentReviewQueue: Array<{ id: string, enrollmentId: string, assessmentId: string, assessmentTitle: string, attemptNumber: number, learnerName: string, submittedAt: string, status: AssessmentAttemptStatus }> };

export type MyAssessmentAttemptsQueryVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  assessmentId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyAssessmentAttemptsQuery = { myAssessmentAttempts: Array<{ id: string, enrollmentId: string, assessmentId: string, assessmentTitle: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, gradedAt: string | null }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { me: { id: string, name: string, email: string, role: UserRole } | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, expiresIn: number, user: { id: string, name: string, email: string, role: UserRole } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = { requestPasswordReset: boolean };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { resetPassword: boolean };

export type CertificateListFieldsFragment = { id: string, enrollmentId: string, certificateNumber: string, recipientName: string, courseTitle: string, issuedAt: string, status: CertificateStatus, verificationCode: string, verificationUrl: string, pdfPath: string, revokedAt: string | null, revokedBy: string | null, revokedReason: string | null };

export type MyCertificatesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyCertificatesQuery = { myCertificates: Array<{ id: string, enrollmentId: string, certificateNumber: string, recipientName: string, courseTitle: string, issuedAt: string, status: CertificateStatus, verificationCode: string, verificationUrl: string, pdfPath: string, revokedAt: string | null, revokedBy: string | null, revokedReason: string | null }> };

export type CertificateForEnrollmentQueryVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
}>;


export type CertificateForEnrollmentQuery = { certificateForEnrollment: { id: string, enrollmentId: string, certificateNumber: string, recipientName: string, courseTitle: string, issuedAt: string, status: CertificateStatus, verificationCode: string, verificationUrl: string, pdfPath: string, revokedAt: string | null, revokedBy: string | null, revokedReason: string | null } | null };

export type CourseListFieldsFragment = { id: string, ownerId: string, title: string, description: string, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string };

export type CoursesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<CourseStatus>;
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CoursesQuery = { courses: Array<{ id: string, ownerId: string, title: string, description: string, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string }> };

export type AdminEmailMessagesQueryVariables = Exact<{
  status?: InputMaybe<EmailDeliveryStatus>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type AdminEmailMessagesQuery = { adminEmailMessages: Array<{ id: string, notificationId: string | null, recipient: string, purpose: string, status: EmailDeliveryStatus, providerMessageId: string | null, failureCode: string | null, createdAt: string, sentAt: string | null, deliveredAt: string | null, bouncedAt: string | null, complainedAt: string | null }> };

export type MyEnrollmentsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyEnrollmentsQuery = { myEnrollments: Array<{ id: string, userId: string, courseId: string, enrolledBy: string, createdAt: string, completedAt: string | null, course: { id: string, ownerId: string, title: string, description: string, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string } }> };

export type CourseEnrollmentsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type CourseEnrollmentsQuery = { courseEnrollments: Array<{ id: string, userId: string, learnerName: string, createdAt: string, completedAt: string | null }> };

export type InvitationsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type InvitationsQuery = { invitations: Array<{ id: string, email: string, role: UserRole, invitedBy: string, acceptedBy: string | null, expiresAt: string, acceptedAt: string | null, revokedAt: string | null, createdAt: string }> };

export type VideoAssetListFieldsFragment = { id: string, title: string, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string };

export type MyVideoAssetsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyVideoAssetsQuery = { myVideoAssets: Array<{ id: string, title: string, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string }> };

export type UsersPageQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type UsersPageQuery = { usersPage: { totalCount: number, items: Array<{ id: string, email: string, name: string, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string }> } };

export type SetUserRoleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  role: UserRole;
}>;


export type SetUserRoleMutation = { setUserRole: { id: string, name: string, email: string, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string } };

export type SetUserDisabledMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  disabled: Scalars['Boolean']['input'];
}>;


export type SetUserDisabledMutation = { setUserDisabled: { id: string, name: string, email: string, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string } };

export type UsersQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type UsersQuery = { users: Array<{ id: string, email: string, name: string, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string }> };

export type PlatformHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformHealthQuery = { health: string };

export type VideoSubmissionReviewQueueQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type VideoSubmissionReviewQueueQuery = { videoSubmissionReviewQueue: Array<{ id: string, enrollmentId: string, itemId: string, attemptNumber: number, promptTitle: string, learnerName: string, createdAt: string, status: VideoSubmissionStatus, asset: { id: string, title: string, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } }> };

export type MyVideoSubmissionsQueryVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyVideoSubmissionsQuery = { myVideoSubmissions: Array<{ id: string, enrollmentId: string, itemId: string, attemptNumber: number, promptTitle: string, instructions: string, maxDurationSeconds: number, requiresReview: boolean, status: VideoSubmissionStatus, failureCode: string | null, feedback: string, reviewedBy: string | null, reviewedAt: string | null, createdAt: string, updatedAt: string, asset: { id: string, title: string, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } }> };

export const CertificateListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<CertificateListFieldsFragment, unknown>;
export const CourseListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CourseListFieldsFragment, unknown>;
export const VideoAssetListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<VideoAssetListFieldsFragment, unknown>;
export const AssessmentReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssessmentReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessmentReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssessmentReviewQueueQuery, AssessmentReviewQueueQueryVariables>;
export const MyAssessmentAttemptsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAssessmentAttempts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAssessmentAttempts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"gradedAt"}}]}}]}}]} as unknown as DocumentNode<MyAssessmentAttemptsQuery, MyAssessmentAttemptsQueryVariables>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const MyCertificatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyCertificates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCertificates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CertificateListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<MyCertificatesQuery, MyCertificatesQueryVariables>;
export const CertificateForEnrollmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CertificateForEnrollment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"certificateForEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CertificateListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<CertificateForEnrollmentQuery, CertificateForEnrollmentQueryVariables>;
export const CoursesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Courses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CourseStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mine"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"mine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mine"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CoursesQuery, CoursesQueryVariables>;
export const AdminEmailMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEmailMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailDeliveryStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEmailMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"purpose"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"providerMessageId"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"bouncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"complainedAt"}}]}}]}}]} as unknown as DocumentNode<AdminEmailMessagesQuery, AdminEmailMessagesQueryVariables>;
export const MyEnrollmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyEnrollments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myEnrollments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"course"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyEnrollmentsQuery, MyEnrollmentsQueryVariables>;
export const CourseEnrollmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseEnrollments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseEnrollments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CourseEnrollmentsQuery, CourseEnrollmentsQueryVariables>;
export const InvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Invitations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"invitedBy"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedBy"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<InvitationsQuery, InvitationsQueryVariables>;
export const MyVideoAssetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyVideoAssets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myVideoAssets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyVideoAssetsQuery, MyVideoAssetsQueryVariables>;
export const UsersPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"disabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UsersPageQuery, UsersPageQueryVariables>;
export const SetUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetUserRoleMutation, SetUserRoleMutationVariables>;
export const SetUserDisabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserDisabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserDisabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"disabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetUserDisabledMutation, SetUserDisabledMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const PlatformHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"}}]}}]} as unknown as DocumentNode<PlatformHealthQuery, PlatformHealthQueryVariables>;
export const VideoSubmissionReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideoSubmissionReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoSubmissionReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<VideoSubmissionReviewQueueQuery, VideoSubmissionReviewQueueQueryVariables>;
export const MyVideoSubmissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyVideoSubmissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myVideoSubmissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"maxDurationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"requiresReview"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedBy"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyVideoSubmissionsQuery, MyVideoSubmissionsQueryVariables>;