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

export type AnalyticsBucket = {
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
};

export type AnalyticsCourse = {
  completed: Scalars['Int']['output'];
  completionRate: Maybe<Scalars['Float']['output']>;
  enrolled: Scalars['Int']['output'];
  firstAttempts: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  passRate: Maybe<Scalars['Float']['output']>;
  passed: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type AnalyticsCourseOption = {
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AnalyticsFilter = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  from: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  to: Scalars['String']['input'];
};

export type AnalyticsFollowUp = {
  courseId: Scalars['ID']['output'];
  courseTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerAvatarUrl: Maybe<Scalars['String']['output']>;
  learnerEmail: Scalars['String']['output'];
  learnerName: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type AnalyticsLesson = {
  completed: Scalars['Int']['output'];
  completionRate: Maybe<Scalars['Float']['output']>;
  courseTitle: Scalars['String']['output'];
  enrolled: Scalars['Int']['output'];
  firstAttempts: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  passRate: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
};

export type AnalyticsQuestion = {
  answers: Scalars['Int']['output'];
  assessmentTitle: Scalars['String']['output'];
  attemptNumber: Scalars['Int']['output'];
  belowFullCredit: Scalars['Int']['output'];
  difficultyRate: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AnalyticsRetry = {
  attemptNumber: Scalars['Int']['output'];
  passRate: Scalars['Float']['output'];
  passed: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AnalyticsTrend = {
  completed: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  enrolled: Scalars['Int']['output'];
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
  learnerAvatarUrl: Maybe<Scalars['String']['output']>;
  learnerName: Scalars['String']['output'];
  status: AssessmentAttemptStatus;
  submittedAt: Scalars['String']['output'];
};

export type AssessmentReviewPage = {
  items: Array<AssessmentReviewEntry>;
  totalCount: Scalars['Int']['output'];
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
  isPrivate: Scalars['Boolean']['output'];
  ownerId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['String']['output']>;
  status: CourseStatus;
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CourseDetail = {
  certificateEnabled: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPrivate: Scalars['Boolean']['output'];
  modules: Array<CourseModule>;
  ownerId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['String']['output']>;
  status: CourseStatus;
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CourseEnrollment = {
  completedAt: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerAvatarUrl: Maybe<Scalars['String']['output']>;
  learnerEmail: Maybe<Scalars['String']['output']>;
  learnerName: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type CourseEnrollmentPage = {
  items: Array<CourseEnrollment>;
  totalCount: Scalars['Int']['output'];
};

export type CourseItem = {
  assessment: Maybe<CatalogAssessment>;
  body: Maybe<Scalars['String']['output']>;
  fileLesson: Maybe<FileLesson>;
  id: Scalars['ID']['output'];
  isLocked: Scalars['Boolean']['output'];
  isPrivate: Scalars['Boolean']['output'];
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
  | 'audio_lesson'
  | 'file_lesson'
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
  isPrivate: Scalars['Boolean']['output'];
  modules: Array<CourseOutlineModule>;
  status: CourseStatus;
  title: Scalars['String']['output'];
};

export type CourseOutlineItem = {
  id: Scalars['ID']['output'];
  isLocked: Scalars['Boolean']['output'];
  isPrivate: Scalars['Boolean']['output'];
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

export type CoursePage = {
  items: Array<Course>;
  totalCount: Scalars['Int']['output'];
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
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateFileLessonInput = {
  fileAssetId?: InputMaybe<Scalars['ID']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
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

export type EmailDeliveryPage = {
  items: Array<EmailDelivery>;
  totalCount: Scalars['Int']['output'];
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
  learningProgress: EnrollmentProgress;
  userId: Scalars['ID']['output'];
};

export type EnrollmentDetail = {
  completedAt: Maybe<Scalars['String']['output']>;
  course: Course;
  courseId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  enrolledBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  learningProgress: EnrollmentProgress;
  progress: Array<ItemProgress>;
  userId: Scalars['ID']['output'];
};

export type EnrollmentPage = {
  items: Array<Enrollment>;
  totalCount: Scalars['Int']['output'];
};

export type EnrollmentProgress = {
  completedRequiredItems: Scalars['Int']['output'];
  percentage: Scalars['Int']['output'];
  totalRequiredItems: Scalars['Int']['output'];
};

export type FileLesson = {
  fileAsset: Maybe<LessonFileAsset>;
  fileAssetId: Maybe<Scalars['ID']['output']>;
};

export type FileUploadTarget = {
  apiKey: Scalars['String']['output'];
  endpoint: Scalars['String']['output'];
  publicId: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
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

export type InvitationPage = {
  items: Array<Invitation>;
  totalCount: Scalars['Int']['output'];
};

export type InvitationStatus =
  | 'accepted'
  | 'expired'
  | 'pending'
  | 'revoked';

export type ItemProgress = {
  completedAt: Maybe<Scalars['String']['output']>;
  fileAssetId: Maybe<Scalars['ID']['output']>;
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

export type LessonAccessGrant = {
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type LessonFileAsset = {
  filename: Scalars['String']['output'];
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sizeBytes: Scalars['Int']['output'];
  status: VideoAssetStatus;
};

export type LessonFileUpload = {
  asset: LessonFileAsset;
  upload: FileUploadTarget;
};

export type LessonFileUploadInput = {
  filename: Scalars['String']['input'];
  format: Scalars['String']['input'];
  requestKey: Scalars['ID']['input'];
  sizeBytes: Scalars['Int']['input'];
};

export type LessonVideoAsset = {
  durationSeconds: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  status: VideoAssetStatus;
  thumbnailUrl: Maybe<Scalars['String']['output']>;
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
  assignCourseByEmail: Enrollment;
  assignCourseOwner: CourseDetail;
  changePassword: Scalars['Boolean']['output'];
  completeFileLesson: ItemProgress;
  completeTextLesson: ItemProgress;
  createAssessment: CourseDetail;
  createAudioLesson: CourseDetail;
  createCourse: Course;
  createCourseModule: CourseDetail;
  createFileLesson: CourseDetail;
  createInvitation: Invitation;
  createLessonFileUpload: LessonFileUpload;
  createLessonVideoUpload: VideoUpload;
  createTextLesson: CourseDetail;
  createVideoLesson: CourseDetail;
  createVideoPrompt: CourseDetail;
  enrollInCourse: Enrollment;
  finalizeLessonFileUpload: LessonFileAsset;
  gradeAssessmentAttempt: AssessmentAttempt;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  logoutAll: Scalars['Boolean']['output'];
  markAllNotificationsRead: Scalars['Int']['output'];
  markNotificationRead: Notification;
  moveCourseItem: CourseDetail;
  publishCourse: CourseDetail;
  recordVideoProgress: VideoProgressReceipt;
  refreshLessonVideoUpload: VideoUpload;
  refreshSession: AuthPayload;
  refreshVideoSubmissionUpload: VideoSubmissionUpload;
  registerLearner: Scalars['Boolean']['output'];
  reorderCourseItems: CourseDetail;
  reorderCourseModules: CourseDetail;
  requestEmailVerification: Scalars['Boolean']['output'];
  requestPasswordReset: Scalars['Boolean']['output'];
  resetPassword: Scalars['Boolean']['output'];
  reviewVideoSubmission: VideoSubmission;
  revokeCertificate: Certificate;
  revokeInvitation: Scalars['Boolean']['output'];
  saveAssessmentAnswers: AssessmentAttempt;
  setAssessmentQuestions: CourseDetail;
  setCoursePrivacy: CourseDetail;
  setLessonAccess: Scalars['Boolean']['output'];
  setLessonPrivacy: CourseDetail;
  setLessonVideoThumbnail: VideoAsset;
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
  updateAudioLesson: CourseDetail;
  updateCourse: CourseDetail;
  updateCourseModule: CourseDetail;
  updateFileLesson: CourseDetail;
  updateMyProfile: User;
  updateTextLesson: CourseDetail;
  updateVideoLesson: CourseDetail;
  updateVideoPrompt: CourseDetail;
  verifyLearnerEmail: AuthPayload;
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


export type MutationAssignCourseByEmailArgs = {
  courseId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
};


export type MutationAssignCourseOwnerArgs = {
  id: Scalars['ID']['input'];
  ownerId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCompleteFileLessonArgs = {
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
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


export type MutationCreateAudioLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateVideoLessonInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationCreateCourseArgs = {
  input: CreateCourseInput;
};


export type MutationCreateCourseModuleArgs = {
  courseId: Scalars['ID']['input'];
  input: CourseModuleInput;
};


export type MutationCreateFileLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: CreateFileLessonInput;
  moduleId: Scalars['ID']['input'];
};


export type MutationCreateInvitationArgs = {
  input: CreateInvitationInput;
};


export type MutationCreateLessonFileUploadArgs = {
  input: LessonFileUploadInput;
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


export type MutationFinalizeLessonFileUploadArgs = {
  id: Scalars['ID']['input'];
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


export type MutationRegisterLearnerArgs = {
  input: RegisterLearnerInput;
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


export type MutationRequestEmailVerificationArgs = {
  appUrl: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationRequestPasswordResetArgs = {
  appUrl?: InputMaybe<Scalars['String']['input']>;
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


export type MutationSetCoursePrivacyArgs = {
  id: Scalars['ID']['input'];
  isPrivate: Scalars['Boolean']['input'];
};


export type MutationSetLessonAccessArgs = {
  allowed: Scalars['Boolean']['input'];
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationSetLessonPrivacyArgs = {
  courseId: Scalars['ID']['input'];
  isPrivate: Scalars['Boolean']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationSetLessonVideoThumbnailArgs = {
  id: Scalars['ID']['input'];
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
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


export type MutationUpdateAudioLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateVideoLessonInput;
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


export type MutationUpdateFileLessonArgs = {
  courseId: Scalars['ID']['input'];
  input: UpdateFileLessonInput;
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationUpdateMyProfileArgs = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
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


export type MutationVerifyLearnerEmailArgs = {
  token: Scalars['String']['input'];
};

export type Notification = {
  createdAt: Scalars['String']['output'];
  entityId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  readAt: Maybe<Scalars['String']['output']>;
  type: NotificationType;
};

export type NotificationPage = {
  items: Array<Notification>;
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type NotificationType =
  | 'assessment_graded'
  | 'certificate_issued'
  | 'course_assigned'
  | 'course_completed'
  | 'grading_pending'
  | 'submission_failed'
  | 'submission_pending_review'
  | 'submission_reviewed';

export type OverviewReviewGroup = {
  courseId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
};

export type OverviewVideo = {
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  adminEmailMessage: EmailDelivery;
  adminEmailMessages: Array<EmailDelivery>;
  adminEmailMessagesPage: EmailDeliveryPage;
  assessmentAttempt: AssessmentAttempt;
  assessmentReviewQueue: Array<AssessmentReviewEntry>;
  assessmentReviewQueuePage: AssessmentReviewPage;
  certificate: Certificate;
  certificateForEnrollment: Maybe<Certificate>;
  course: CourseDetail;
  courseEnrollments: Array<CourseEnrollment>;
  courseEnrollmentsPage: CourseEnrollmentPage;
  courseOutline: CourseOutline;
  courses: Array<Course>;
  coursesPage: CoursePage;
  enrollment: EnrollmentDetail;
  health: Scalars['String']['output'];
  invitations: Array<Invitation>;
  invitationsPage: InvitationPage;
  lessonAccessGrants: Array<LessonAccessGrant>;
  lessonFileAsset: LessonFileAsset;
  lessonFilePreview: VideoPlayback;
  lessonPlayback: VideoPlayback;
  me: Maybe<User>;
  myAssessmentAttempts: Array<AssessmentAttemptSummary>;
  myCertificates: Array<Certificate>;
  myCourseEnrollment: Maybe<EnrollmentDetail>;
  myEnrollments: Array<Enrollment>;
  myEnrollmentsPage: EnrollmentPage;
  myNotificationEmailOptOuts: Array<NotificationType>;
  myNotifications: Array<Notification>;
  myNotificationsPage: NotificationPage;
  myVideoAssets: Array<VideoAsset>;
  myVideoAssetsPage: VideoAssetPage;
  myVideoSubmissions: Array<VideoSubmission>;
  previewLessonVideo: VideoPlayback;
  users: Array<User>;
  usersPage: UserPage;
  verifyCertificate: Maybe<CertificateVerification>;
  videoAsset: VideoAsset;
  videoSubmission: VideoSubmission;
  videoSubmissionPlayback: VideoPlayback;
  videoSubmissionReviewQueue: Array<VideoSubmissionReviewEntry>;
  videoSubmissionReviewQueuePage: VideoSubmissionReviewPage;
  workspaceAnalytics: WorkspaceAnalytics;
  workspaceOverview: WorkspaceOverview;
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


export type QueryAdminEmailMessagesPageArgs = {
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


export type QueryAssessmentReviewQueuePageArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
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


export type QueryCourseEnrollmentsPageArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
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


export type QueryCoursesPageArgs = {
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


export type QueryInvitationsPageArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<InvitationStatus>;
};


export type QueryLessonAccessGrantsArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type QueryLessonFileAssetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLessonFilePreviewArgs = {
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
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


export type QueryMyCourseEnrollmentArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryMyEnrollmentsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyEnrollmentsPageArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyNotificationsPageArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  unreadOnly?: Scalars['Boolean']['input'];
};


export type QueryMyVideoAssetsArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryMyVideoAssetsPageArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<VideoAssetStatus>;
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


export type QueryVideoSubmissionReviewQueuePageArgs = {
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceAnalyticsArgs = {
  input: AnalyticsFilter;
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

export type RegisterLearnerInput = {
  appUrl: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
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
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFileLessonInput = {
  fileAssetId?: InputMaybe<Scalars['ID']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
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
  avatarUrl: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  disabledAt: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  emailVerifiedAt: Maybe<Scalars['String']['output']>;
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
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
  thumbnailUrl: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type VideoAssetPage = {
  items: Array<VideoAsset>;
  totalCount: Scalars['Int']['output'];
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
  learnerAvatarUrl: Maybe<Scalars['String']['output']>;
  learnerName: Scalars['String']['output'];
  promptTitle: Scalars['String']['output'];
  status: VideoSubmissionStatus;
};

export type VideoSubmissionReviewPage = {
  items: Array<VideoSubmissionReviewEntry>;
  totalCount: Scalars['Int']['output'];
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

export type WorkspaceAnalytics = {
  completed: Scalars['Int']['output'];
  coursePerformance: Array<AnalyticsCourse>;
  courses: Array<AnalyticsCourseOption>;
  enrolled: Scalars['Int']['output'];
  firstAttempts: Scalars['Int']['output'];
  followUpCount: Scalars['Int']['output'];
  followUps: Array<AnalyticsFollowUp>;
  from: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  gradedAttempts: Scalars['Int']['output'];
  inProgress: Scalars['Int']['output'];
  learners: Scalars['Int']['output'];
  lessons: Array<AnalyticsLesson>;
  notStarted: Scalars['Int']['output'];
  passed: Scalars['Int']['output'];
  pendingAssessments: Scalars['Int']['output'];
  pendingVideos: Scalars['Int']['output'];
  questions: Array<AnalyticsQuestion>;
  retries: Array<AnalyticsRetry>;
  reviewAge: Array<AnalyticsBucket>;
  scoreDistribution: Array<AnalyticsBucket>;
  to: Scalars['String']['output'];
  trend: Array<AnalyticsTrend>;
};

export type WorkspaceOverview = {
  activeLearners: Scalars['Int']['output'];
  assessmentReviews: Array<OverviewReviewGroup>;
  completedEnrollments: Scalars['Int']['output'];
  draftCourses: Scalars['Int']['output'];
  draftsNeedingWork: Array<Course>;
  emailIssues: Maybe<Scalars['Int']['output']>;
  failedVideoItems: Array<OverviewVideo>;
  failedVideos: Scalars['Int']['output'];
  generatedAt: Scalars['String']['output'];
  incompleteDrafts: Scalars['Int']['output'];
  pendingAssessments: Scalars['Int']['output'];
  pendingInvitations: Maybe<Scalars['Int']['output']>;
  pendingReviews: Scalars['Int']['output'];
  pendingVideoReviews: Scalars['Int']['output'];
  publishedCourses: Scalars['Int']['output'];
  recentCourses: Array<Course>;
  totalEnrollments: Scalars['Int']['output'];
  videoReviews: Array<OverviewReviewGroup>;
};

export type WorkspaceAnalyticsQueryVariables = Exact<{
  input: AnalyticsFilter;
}>;


export type WorkspaceAnalyticsQuery = { workspaceAnalytics: { from: string, to: string, generatedAt: string, enrolled: number, learners: number, notStarted: number, inProgress: number, completed: number, firstAttempts: number, passed: number, gradedAttempts: number, pendingAssessments: number, pendingVideos: number, followUpCount: number, courses: Array<{ id: string, title: string }>, coursePerformance: Array<{ id: string, title: string, enrolled: number, completed: number, completionRate: number | null, firstAttempts: number, passed: number, passRate: number | null }>, trend: Array<{ date: string, enrolled: number, completed: number }>, scoreDistribution: Array<{ label: string, count: number }>, retries: Array<{ attemptNumber: number, passed: number, total: number, passRate: number }>, reviewAge: Array<{ label: string, count: number }>, lessons: Array<{ id: string, title: string, courseTitle: string, enrolled: number, completed: number, completionRate: number | null, firstAttempts: number, passRate: number | null }>, questions: Array<{ id: string, title: string, assessmentTitle: string, attemptNumber: number, answers: number, belowFullCredit: number, difficultyRate: number }>, followUps: Array<{ id: string, learnerName: string, learnerAvatarUrl: string | null, learnerEmail: string, courseId: string, courseTitle: string, reason: string }> } };

export type AssessmentReviewQueueQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type AssessmentReviewQueueQuery = { assessmentReviewQueue: Array<{ id: string, enrollmentId: string, assessmentId: string, assessmentTitle: string, attemptNumber: number, learnerName: string, learnerAvatarUrl: string | null, submittedAt: string, status: AssessmentAttemptStatus }> };

export type MyAssessmentAttemptsQueryVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  assessmentId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyAssessmentAttemptsQuery = { myAssessmentAttempts: Array<{ id: string, enrollmentId: string, assessmentId: string, assessmentTitle: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, gradedAt: string | null }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { me: { id: string, name: string, email: string, role: UserRole } | null };

export type RegisterLearnerMutationVariables = Exact<{
  input: RegisterLearnerInput;
}>;


export type RegisterLearnerMutation = { registerLearner: boolean };

export type RequestEmailVerificationMutationVariables = Exact<{
  email: Scalars['String']['input'];
  appUrl: Scalars['String']['input'];
}>;


export type RequestEmailVerificationMutation = { requestEmailVerification: boolean };

export type VerifyLearnerEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type VerifyLearnerEmailMutation = { verifyLearnerEmail: { accessToken: string, expiresIn: number, user: { id: string, name: string, email: string, role: UserRole, avatarUrl: string | null, phone: string | null } } };

export type MyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAccountQuery = { me: { id: string, name: string, email: string, role: UserRole, phone: string | null, avatarUrl: string | null, hasPassword: boolean } | null };

export type UpdateMyProfileMutationVariables = Exact<{
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateMyProfileMutation = { updateMyProfile: { id: string, name: string, email: string, role: UserRole, phone: string | null, avatarUrl: string | null, hasPassword: boolean } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { changePassword: boolean };

export type LogoutAllMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutAllMutation = { logoutAll: boolean };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, expiresIn: number, user: { id: string, name: string, email: string, role: UserRole, avatarUrl: string | null, phone: string | null } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshSessionMutation = { refreshSession: { accessToken: string, expiresIn: number, user: { id: string, name: string, email: string, role: UserRole, avatarUrl: string | null, phone: string | null } } };

export type AcceptInvitationMutationVariables = Exact<{
  input: AcceptInvitationInput;
}>;


export type AcceptInvitationMutation = { acceptInvitation: { accessToken: string, expiresIn: number, user: { id: string, name: string, email: string, role: UserRole, avatarUrl: string | null, phone: string | null } } };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
  appUrl?: InputMaybe<Scalars['String']['input']>;
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

export type CourseManagementQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CourseManagementQuery = { course: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, isPrivate: boolean, publishedAt: string | null, createdAt: string, updatedAt: string, modules: Array<{ id: string, title: string, position: number, items: Array<{ id: string, title: string, type: CourseItemType, position: number, required: boolean, isPrivate: boolean, body: string | null, fileLesson: { fileAssetId: string | null, fileAsset: { id: string, filename: string, format: string, sizeBytes: number, status: VideoAssetStatus } | null } | null, videoLesson: { videoAssetId: string | null, completionThreshold: number, videoAsset: { id: string, thumbnailUrl: string | null, status: VideoAssetStatus, durationSeconds: number | null } | null } | null, assessment: { passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, questions: Array<{ id: string, type: QuestionType, prompt: string, points: number, position: number, explanation: string, referenceAnswer: string | null, options: Array<{ id: string, label: string, position: number, isCorrect: boolean }> }> | null } | null, videoPrompt: { instructions: string, maxDurationSeconds: number, requiresReview: boolean } | null }> }> } };

export type SetCoursePrivacyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  isPrivate: Scalars['Boolean']['input'];
}>;


export type SetCoursePrivacyMutation = { setCoursePrivacy: { id: string } };

export type SetLessonPrivacyMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  isPrivate: Scalars['Boolean']['input'];
}>;


export type SetLessonPrivacyMutation = { setLessonPrivacy: { id: string } };

export type LessonAccessGrantsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type LessonAccessGrantsQuery = { lessonAccessGrants: Array<{ userId: string, name: string, email: string }> };

export type SetLessonAccessMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
  allowed: Scalars['Boolean']['input'];
}>;


export type SetLessonAccessMutation = { setLessonAccess: boolean };

export type AssignCourseByEmailMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
}>;


export type AssignCourseByEmailMutation = { assignCourseByEmail: { id: string } };

export type ManageModuleMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CourseModuleInput;
}>;


export type ManageModuleMutation = { updateCourseModule: { id: string } };

export type ArchiveModuleMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
}>;


export type ArchiveModuleMutation = { archiveCourseModule: { id: string } };

export type ReorderModulesMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  orderedIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type ReorderModulesMutation = { reorderCourseModules: { id: string } };

export type ReorderLessonsMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  orderedIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type ReorderLessonsMutation = { reorderCourseItems: { id: string } };

export type ArchiveLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type ArchiveLessonMutation = { archiveCourseItem: { id: string } };

export type MoveLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  targetModuleId: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
}>;


export type MoveLessonMutation = { moveCourseItem: { id: string } };

export type AddTextLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateTextLessonInput;
}>;


export type AddTextLessonMutation = { createTextLesson: { id: string } };

export type EditTextLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateTextLessonInput;
}>;


export type EditTextLessonMutation = { updateTextLesson: { id: string } };

export type AddVideoLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateVideoLessonInput;
}>;


export type AddVideoLessonMutation = { createVideoLesson: { id: string } };

export type EditVideoLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateVideoLessonInput;
}>;


export type EditVideoLessonMutation = { updateVideoLesson: { id: string } };

export type AddAssessmentMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateAssessmentInput;
}>;


export type AddAssessmentMutation = { createAssessment: { id: string } };

export type EditAssessmentMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateAssessmentInput;
}>;


export type EditAssessmentMutation = { updateAssessment: { id: string } };

export type AddVideoPromptMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateVideoPromptInput;
}>;


export type AddVideoPromptMutation = { createVideoPrompt: { id: string } };

export type EditVideoPromptMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateVideoPromptInput;
}>;


export type EditVideoPromptMutation = { updateVideoPrompt: { id: string } };

export type SetCourseQuestionsMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  questions: Array<AuthoringQuestionInput> | AuthoringQuestionInput;
}>;


export type SetCourseQuestionsMutation = { setAssessmentQuestions: { id: string } };

export type SetCourseOwnerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  ownerId: Scalars['ID']['input'];
}>;


export type SetCourseOwnerMutation = { assignCourseOwner: { id: string, ownerId: string } };

export type SetCourseCertificateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetCourseCertificateMutation = { updateCourse: { id: string, certificateEnabled: boolean } };

export type AssignCourseLearnerMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type AssignCourseLearnerMutation = { assignCourse: { id: string } };

export type CourseLearnersQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CourseLearnersQuery = { courseEnrollmentsPage: { totalCount: number, items: Array<{ id: string, userId: string, learnerName: string, learnerEmail: string | null, learnerAvatarUrl: string | null, createdAt: string, completedAt: string | null }> } };

export type CourseLearnerDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CourseLearnerDetailsQuery = { enrollment: { id: string, courseId: string, userId: string, createdAt: string, completedAt: string | null, progress: Array<{ itemId: string, status: ItemProgressStatus, watchedPercentage: number, completedAt: string | null }> }, certificateForEnrollment: { id: string, certificateNumber: string, recipientName: string, issuedAt: string, status: CertificateStatus, verificationUrl: string, revokedReason: string | null } | null };

export type CourseAssessmentReviewsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CourseAssessmentReviewsQuery = { assessmentReviewQueuePage: { totalCount: number, items: Array<{ id: string, assessmentTitle: string, learnerName: string, learnerAvatarUrl: string | null, attemptNumber: number, submittedAt: string, status: AssessmentAttemptStatus }> } };

export type CourseVideoReviewsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CourseVideoReviewsQuery = { videoSubmissionReviewQueuePage: { totalCount: number, items: Array<{ id: string, promptTitle: string, learnerName: string, learnerAvatarUrl: string | null, attemptNumber: number, createdAt: string, status: VideoSubmissionStatus, asset: { id: string, title: string, status: VideoAssetStatus } }> } };

export type CourseAttemptReviewQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CourseAttemptReviewQuery = { assessmentAttempt: { id: string, assessmentTitle: string, status: AssessmentAttemptStatus, maxScore: number, score: number | null, passed: boolean | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, referenceAnswer: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string }> } }> } };

export type GradeCourseAttemptMutationVariables = Exact<{
  input: GradeAssessmentAttemptInput;
}>;


export type GradeCourseAttemptMutation = { gradeAssessmentAttempt: { id: string, status: AssessmentAttemptStatus, score: number | null, passed: boolean | null } };

export type CourseSubmissionReviewQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CourseSubmissionReviewQuery = { videoSubmission: { id: string, promptTitle: string, instructions: string, status: VideoSubmissionStatus, feedback: string, maxDurationSeconds: number }, videoSubmissionPlayback: { url: string, expires: number } };

export type ReviewCourseSubmissionMutationVariables = Exact<{
  input: ReviewVideoSubmissionInput;
}>;


export type ReviewCourseSubmissionMutation = { reviewVideoSubmission: { id: string, status: VideoSubmissionStatus, feedback: string } };

export type RevokeCourseCertificateMutationVariables = Exact<{
  input: RevokeCertificateInput;
}>;


export type RevokeCourseCertificateMutation = { revokeCertificate: { id: string, status: CertificateStatus } };

export type CourseLessonPlaybackQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type CourseLessonPlaybackQuery = { lessonPlayback: { url: string, expires: number } };

export type CourseListFieldsFragment = { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string };

export type CoursesPageQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<CourseStatus>;
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CoursesPageQuery = { coursesPage: { totalCount: number, items: Array<{ id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string }> } };

export type CourseDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CourseDetailsQuery = { course: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string, modules: Array<{ id: string, title: string, position: number, items: Array<{ id: string, title: string, type: CourseItemType, position: number, required: boolean }> }> } };

export type CreateCourseMutationVariables = Exact<{
  input: CreateCourseInput;
}>;


export type CreateCourseMutation = { createCourse: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string } };

export type UpdateCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCourseInput;
}>;


export type UpdateCourseMutation = { updateCourse: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string } };

export type PublishCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PublishCourseMutation = { publishCourse: { id: string, title: string, status: CourseStatus } };

export type UnpublishCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnpublishCourseMutation = { unpublishCourse: { id: string, title: string, status: CourseStatus } };

export type ArchiveCourseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ArchiveCourseMutation = { archiveCourse: { id: string, title: string, status: CourseStatus } };

export type CreateCourseModuleMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  input: CourseModuleInput;
}>;


export type CreateCourseModuleMutation = { createCourseModule: { id: string, modules: Array<{ id: string, title: string, position: number }> } };

export type CoursesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<CourseStatus>;
  mine?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type CoursesQuery = { courses: Array<{ id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string }> };

export type CreateLessonDocumentUploadMutationVariables = Exact<{
  input: LessonFileUploadInput;
}>;


export type CreateLessonDocumentUploadMutation = { createLessonFileUpload: { asset: { id: string, filename: string, format: string, sizeBytes: number, status: VideoAssetStatus }, upload: { endpoint: string, publicId: string, timestamp: string, apiKey: string, signature: string } } };

export type FinalizeLessonDocumentUploadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FinalizeLessonDocumentUploadMutation = { finalizeLessonFileUpload: { id: string, filename: string, format: string, sizeBytes: number, status: VideoAssetStatus } };

export type LessonDocumentAssetQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type LessonDocumentAssetQuery = { lessonFileAsset: { id: string, filename: string, format: string, sizeBytes: number, status: VideoAssetStatus } };

export type LessonDocumentPreviewQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type LessonDocumentPreviewQuery = { lessonFilePreview: { url: string, expires: number } };

export type AddFileLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateFileLessonInput;
}>;


export type AddFileLessonMutation = { createFileLesson: { id: string } };

export type EditFileLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateFileLessonInput;
}>;


export type EditFileLessonMutation = { updateFileLesson: { id: string } };

export type AddAudioLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  input: CreateVideoLessonInput;
}>;


export type AddAudioLessonMutation = { createAudioLesson: { id: string } };

export type EditAudioLessonMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  input: UpdateVideoLessonInput;
}>;


export type EditAudioLessonMutation = { updateAudioLesson: { id: string } };

export type MarkLearnerFileReadMutationVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type MarkLearnerFileReadMutation = { completeFileLesson: { itemId: string, status: ItemProgressStatus, completedAt: string | null, fileAssetId: string | null } };

export type AdminEmailMessagesQueryVariables = Exact<{
  status?: InputMaybe<EmailDeliveryStatus>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type AdminEmailMessagesQuery = { adminEmailMessages: Array<{ id: string, notificationId: string | null, recipient: string, purpose: string, status: EmailDeliveryStatus, providerMessageId: string | null, failureCode: string | null, createdAt: string, sentAt: string | null, deliveredAt: string | null, bouncedAt: string | null, complainedAt: string | null }> };

export type AdminEmailMessagesPageQueryVariables = Exact<{
  status?: InputMaybe<EmailDeliveryStatus>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  recipient?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type AdminEmailMessagesPageQuery = { adminEmailMessagesPage: { totalCount: number, items: Array<{ id: string, notificationId: string | null, recipient: string, purpose: string, status: EmailDeliveryStatus, providerMessageId: string | null, failureCode: string | null, createdAt: string, sentAt: string | null, deliveredAt: string | null, bouncedAt: string | null, complainedAt: string | null }> } };

export type AdminEmailMessageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AdminEmailMessageQuery = { adminEmailMessage: { id: string, notificationId: string | null, recipient: string, purpose: string, status: EmailDeliveryStatus, providerMessageId: string | null, failureCode: string | null, createdAt: string, sentAt: string | null, deliveredAt: string | null, bouncedAt: string | null, complainedAt: string | null } };

export type MyEnrollmentsPageQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyEnrollmentsPageQuery = { myEnrollmentsPage: { totalCount: number, items: Array<{ id: string, userId: string, courseId: string, enrolledBy: string, createdAt: string, completedAt: string | null, learningProgress: { completedRequiredItems: number, totalRequiredItems: number, percentage: number }, course: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string } }> } };

export type MyEnrollmentsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyEnrollmentsQuery = { myEnrollments: Array<{ id: string, userId: string, courseId: string, enrolledBy: string, createdAt: string, completedAt: string | null, learningProgress: { completedRequiredItems: number, totalRequiredItems: number, percentage: number }, course: { id: string, ownerId: string, title: string, description: string, thumbnailUrl: string | null, status: CourseStatus, certificateEnabled: boolean, publishedAt: string | null, createdAt: string, updatedAt: string } }> };

export type CourseEnrollmentsQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type CourseEnrollmentsQuery = { courseEnrollments: Array<{ id: string, userId: string, learnerName: string, learnerAvatarUrl: string | null, createdAt: string, completedAt: string | null }> };

export type InvitationsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type InvitationsQuery = { invitations: Array<{ id: string, email: string, role: UserRole, invitedBy: string, acceptedBy: string | null, expiresAt: string, acceptedAt: string | null, revokedAt: string | null, createdAt: string }> };

export type InvitationsPageQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  status?: InputMaybe<InvitationStatus>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type InvitationsPageQuery = { invitationsPage: { totalCount: number, items: Array<{ id: string, email: string, role: UserRole, invitedBy: string, acceptedBy: string | null, expiresAt: string, acceptedAt: string | null, revokedAt: string | null, createdAt: string }> } };

export type CreateInvitationMutationVariables = Exact<{
  input: CreateInvitationInput;
}>;


export type CreateInvitationMutation = { createInvitation: { id: string, email: string, role: UserRole, invitedBy: string, acceptedBy: string | null, expiresAt: string, acceptedAt: string | null, revokedAt: string | null, createdAt: string } };

export type RevokeInvitationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RevokeInvitationMutation = { revokeInvitation: boolean };

export type LearnerCourseStateQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type LearnerCourseStateQuery = { courseOutline: { id: string, title: string, description: string, status: CourseStatus, isPrivate: boolean, modules: Array<{ id: string, title: string, position: number, items: Array<{ id: string, title: string, type: CourseItemType, position: number, required: boolean, isPrivate: boolean, isLocked: boolean }> }> }, myCourseEnrollment: { id: string, userId: string, courseId: string, createdAt: string, completedAt: string | null, learningProgress: { percentage: number, completedRequiredItems: number, totalRequiredItems: number }, progress: Array<{ itemId: string, status: ItemProgressStatus, fileAssetId: string | null, resumePositionSeconds: number, watchedPercentage: number, completedAt: string | null, updatedAt: string }> } | null };

export type LearnerCourseContentQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type LearnerCourseContentQuery = { course: { id: string, title: string, certificateEnabled: boolean, modules: Array<{ id: string, title: string, position: number, items: Array<{ id: string, title: string, type: CourseItemType, position: number, required: boolean, isPrivate: boolean, isLocked: boolean, body: string | null, fileLesson: { fileAssetId: string | null, fileAsset: { id: string, filename: string, format: string, sizeBytes: number, status: VideoAssetStatus } | null } | null, videoLesson: { completionThreshold: number, videoAssetId: string | null, videoAsset: { id: string, status: VideoAssetStatus, durationSeconds: number | null } | null } | null, assessment: { passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null } | null, videoPrompt: { instructions: string, maxDurationSeconds: number, requiresReview: boolean } | null }> }> } };

export type JoinLearnerCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type JoinLearnerCourseMutation = { enrollInCourse: { id: string } };

export type MarkLearnerTextReadMutationVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type MarkLearnerTextReadMutation = { completeTextLesson: { itemId: string, status: ItemProgressStatus, completedAt: string | null } };

export type LearnerLessonPlaybackQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  moduleId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
}>;


export type LearnerLessonPlaybackQuery = { lessonPlayback: { url: string, expires: number } };

export type StartLearnerVideoProgressMutationVariables = Exact<{
  input: StartVideoProgressInput;
}>;


export type StartLearnerVideoProgressMutation = { startVideoProgress: { sessionId: string, durationSeconds: number, completionThreshold: number, heartbeatIntervalSeconds: number } };

export type ReportLearnerVideoProgressMutationVariables = Exact<{
  input: RecordVideoProgressInput;
}>;


export type ReportLearnerVideoProgressMutation = { recordVideoProgress: { accepted: boolean, buffered: boolean } };

export type LearnerAttemptFieldsFragment = { id: string, enrollmentId: string, assessmentId: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string, position: number }> } }> };

export type LearnerAssessmentAttemptQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type LearnerAssessmentAttemptQuery = { assessmentAttempt: { id: string, enrollmentId: string, assessmentId: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string, position: number }> } }> } };

export type StartLearnerAssessmentMutationVariables = Exact<{
  input: StartAssessmentAttemptInput;
}>;


export type StartLearnerAssessmentMutation = { startAssessmentAttempt: { id: string, enrollmentId: string, assessmentId: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string, position: number }> } }> } };

export type SaveLearnerAssessmentMutationVariables = Exact<{
  input: SaveAssessmentAnswersInput;
}>;


export type SaveLearnerAssessmentMutation = { saveAssessmentAnswers: { id: string, enrollmentId: string, assessmentId: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string, position: number }> } }> } };

export type SubmitLearnerAssessmentMutationVariables = Exact<{
  input: SubmitAssessmentAttemptInput;
}>;


export type SubmitLearnerAssessmentMutation = { submitAssessmentAttempt: { id: string, enrollmentId: string, assessmentId: string, attemptNumber: number, status: AssessmentAttemptStatus, passMark: number, attemptLimit: number | null, timeLimitSeconds: number | null, maxScore: number, score: number | null, passed: boolean | null, version: number, startedAt: string, deadlineAt: string | null, submittedAt: string | null, answers: Array<{ selectedOptionId: string | null, textAnswer: string | null, awardedPoints: number | null, feedback: string | null, explanation: string | null, question: { id: string, type: QuestionType, prompt: string, points: number, options: Array<{ id: string, label: string, position: number }> } }> } };

export type StartLearnerSubmissionMutationVariables = Exact<{
  input: VideoSubmissionUploadInput;
}>;


export type StartLearnerSubmissionMutation = { startVideoSubmission: { submission: { id: string, asset: { id: string } }, upload: { endpoint: string, videoId: string, libraryId: string, signature: string, expires: number } } };

export type ResumeLearnerSubmissionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResumeLearnerSubmissionMutation = { refreshVideoSubmissionUpload: { submission: { id: string, asset: { id: string } }, upload: { endpoint: string, videoId: string, libraryId: string, signature: string, expires: number } } };

export type SyncLearnerSubmissionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SyncLearnerSubmissionMutation = { syncVideoSubmission: { id: string, status: VideoSubmissionStatus, feedback: string } };

export type VideoAssetListFieldsFragment = { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string };

export type MyVideoAssetsPageQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<VideoAssetStatus>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyVideoAssetsPageQuery = { myVideoAssetsPage: { totalCount: number, items: Array<{ id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string }> } };

export type VideoAssetDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type VideoAssetDetailsQuery = { videoAsset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } };

export type PreviewLessonVideoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PreviewLessonVideoQuery = { previewLessonVideo: { url: string, expires: number } };

export type CreateLessonVideoUploadMutationVariables = Exact<{
  input: LessonVideoUploadInput;
}>;


export type CreateLessonVideoUploadMutation = { createLessonVideoUpload: { asset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string }, upload: { endpoint: string, videoId: string, libraryId: string, signature: string, expires: number } } };

export type RefreshLessonVideoUploadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RefreshLessonVideoUploadMutation = { refreshLessonVideoUpload: { asset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string }, upload: { endpoint: string, videoId: string, libraryId: string, signature: string, expires: number } } };

export type SyncLessonVideoAssetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SyncLessonVideoAssetMutation = { syncLessonVideoAsset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } };

export type SetLessonVideoThumbnailMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetLessonVideoThumbnailMutation = { setLessonVideoThumbnail: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } };

export type MyVideoAssetsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyVideoAssetsQuery = { myVideoAssets: Array<{ id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string }> };

export type NotificationFieldsFragment = { id: string, type: NotificationType, entityId: string, createdAt: string, readAt: string | null };

export type MyNotificationsPageQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  unreadOnly?: Scalars['Boolean']['input'];
}>;


export type MyNotificationsPageQuery = { myNotificationsPage: { totalCount: number, unreadCount: number, items: Array<{ id: string, type: NotificationType, entityId: string, createdAt: string, readAt: string | null }> } };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { markNotificationRead: { id: string, type: NotificationType, entityId: string, createdAt: string, readAt: string | null } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: number };

export type MyNotificationEmailOptOutsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyNotificationEmailOptOutsQuery = { myNotificationEmailOptOuts: Array<NotificationType> };

export type SetNotificationEmailEnabledMutationVariables = Exact<{
  type: NotificationType;
  enabled: Scalars['Boolean']['input'];
}>;


export type SetNotificationEmailEnabledMutation = { setNotificationEmailEnabled: boolean };

export type WorkspaceOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspaceOverviewQuery = { workspaceOverview: { publishedCourses: number, draftCourses: number, activeLearners: number, totalEnrollments: number, completedEnrollments: number, pendingReviews: number, pendingAssessments: number, pendingVideoReviews: number, failedVideos: number, incompleteDrafts: number, pendingInvitations: number | null, emailIssues: number | null, generatedAt: string, recentCourses: Array<{ id: string, title: string, thumbnailUrl: string | null, status: CourseStatus, updatedAt: string }>, draftsNeedingWork: Array<{ id: string, title: string, thumbnailUrl: string | null, status: CourseStatus, updatedAt: string }>, assessmentReviews: Array<{ courseId: string, title: string, totalCount: number }>, videoReviews: Array<{ courseId: string, title: string, totalCount: number }>, failedVideoItems: Array<{ id: string, title: string }> } };

export type UsersPageQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type UsersPageQuery = { usersPage: { totalCount: number, items: Array<{ id: string, email: string, name: string, avatarUrl: string | null, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string }> } };

export type SetUserRoleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  role: UserRole;
}>;


export type SetUserRoleMutation = { setUserRole: { id: string, name: string, email: string, avatarUrl: string | null, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string } };

export type SetUserDisabledMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  disabled: Scalars['Boolean']['input'];
}>;


export type SetUserDisabledMutation = { setUserDisabled: { id: string, name: string, email: string, avatarUrl: string | null, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string } };

export type UsersQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type UsersQuery = { users: Array<{ id: string, email: string, name: string, avatarUrl: string | null, role: UserRole, emailVerifiedAt: string | null, disabledAt: string | null, createdAt: string, updatedAt: string }> };

export type PlatformHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformHealthQuery = { health: string };

export type VideoSubmissionReviewQueueQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type VideoSubmissionReviewQueueQuery = { videoSubmissionReviewQueue: Array<{ id: string, enrollmentId: string, itemId: string, attemptNumber: number, promptTitle: string, learnerName: string, learnerAvatarUrl: string | null, createdAt: string, status: VideoSubmissionStatus, asset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } }> };

export type MyVideoSubmissionsQueryVariables = Exact<{
  enrollmentId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
}>;


export type MyVideoSubmissionsQuery = { myVideoSubmissions: Array<{ id: string, enrollmentId: string, itemId: string, attemptNumber: number, promptTitle: string, instructions: string, maxDurationSeconds: number, requiresReview: boolean, status: VideoSubmissionStatus, failureCode: string | null, feedback: string, reviewedBy: string | null, reviewedAt: string | null, createdAt: string, updatedAt: string, asset: { id: string, title: string, thumbnailUrl: string | null, mimeType: string, status: VideoAssetStatus, durationSeconds: number | null, sizeBytes: string | null, createdAt: string, updatedAt: string } }> };

export const CertificateListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<CertificateListFieldsFragment, unknown>;
export const CourseListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CourseListFieldsFragment, unknown>;
export const LearnerAttemptFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearnerAttemptFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentAttempt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<LearnerAttemptFieldsFragment, unknown>;
export const VideoAssetListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<VideoAssetListFieldsFragment, unknown>;
export const NotificationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]} as unknown as DocumentNode<NotificationFieldsFragment, unknown>;
export const WorkspaceAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AnalyticsFilter"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"enrolled"}},{"kind":"Field","name":{"kind":"Name","value":"learners"}},{"kind":"Field","name":{"kind":"Name","value":"notStarted"}},{"kind":"Field","name":{"kind":"Name","value":"inProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"firstAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"gradedAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"pendingAssessments"}},{"kind":"Field","name":{"kind":"Name","value":"pendingVideos"}},{"kind":"Field","name":{"kind":"Name","value":"courses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coursePerformance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"enrolled"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"completionRate"}},{"kind":"Field","name":{"kind":"Name","value":"firstAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"passRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trend"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"enrolled"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreDistribution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"retries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"passRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviewAge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lessons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"enrolled"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"completionRate"}},{"kind":"Field","name":{"kind":"Name","value":"firstAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"passRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"answers"}},{"kind":"Field","name":{"kind":"Name","value":"belowFullCredit"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"followUps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"learnerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"followUpCount"}}]}}]}}]} as unknown as DocumentNode<WorkspaceAnalyticsQuery, WorkspaceAnalyticsQueryVariables>;
export const AssessmentReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssessmentReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessmentReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssessmentReviewQueueQuery, AssessmentReviewQueueQueryVariables>;
export const MyAssessmentAttemptsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAssessmentAttempts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAssessmentAttempts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"gradedAt"}}]}}]}}]} as unknown as DocumentNode<MyAssessmentAttemptsQuery, MyAssessmentAttemptsQueryVariables>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const RegisterLearnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterLearner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterLearnerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerLearner"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RegisterLearnerMutation, RegisterLearnerMutationVariables>;
export const RequestEmailVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestEmailVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"appUrl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestEmailVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"appUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"appUrl"}}}]}]}}]} as unknown as DocumentNode<RequestEmailVerificationMutation, RequestEmailVerificationMutationVariables>;
export const VerifyLearnerEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyLearnerEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyLearnerEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyLearnerEmailMutation, VerifyLearnerEmailMutationVariables>;
export const MyAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}}]}}]}}]} as unknown as DocumentNode<MyAccountQuery, MyAccountQueryVariables>;
export const UpdateMyProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"avatarUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"avatarUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"avatarUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}}]}}]}}]} as unknown as DocumentNode<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const LogoutAllDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogoutAll"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoutAll"}}]}}]} as unknown as DocumentNode<LogoutAllMutation, LogoutAllMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]} as unknown as DocumentNode<RefreshSessionMutation, RefreshSessionMutationVariables>;
export const AcceptInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcceptInvitationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]}}]} as unknown as DocumentNode<AcceptInvitationMutation, AcceptInvitationMutationVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"appUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"appUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"appUrl"}}}]}]}}]} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const MyCertificatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyCertificates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCertificates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CertificateListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<MyCertificatesQuery, MyCertificatesQueryVariables>;
export const CertificateForEnrollmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CertificateForEnrollment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"certificateForEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CertificateListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CertificateListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Certificate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"courseTitle"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationCode"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pdfPath"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedBy"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]} as unknown as DocumentNode<CertificateForEnrollmentQuery, CertificateForEnrollmentQueryVariables>;
export const CourseManagementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseManagement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"course"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fileLesson"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"fileAsset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoLesson"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"completionThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"videoAsset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"referenceAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"isCorrect"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoPrompt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"maxDurationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"requiresReview"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CourseManagementQuery, CourseManagementQueryVariables>;
export const SetCoursePrivacyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCoursePrivacy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isPrivate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCoursePrivacy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"isPrivate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isPrivate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetCoursePrivacyMutation, SetCoursePrivacyMutationVariables>;
export const SetLessonPrivacyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetLessonPrivacy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isPrivate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLessonPrivacy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isPrivate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isPrivate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetLessonPrivacyMutation, SetLessonPrivacyMutationVariables>;
export const LessonAccessGrantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LessonAccessGrants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lessonAccessGrants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<LessonAccessGrantsQuery, LessonAccessGrantsQueryVariables>;
export const SetLessonAccessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetLessonAccess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"allowed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLessonAccess"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"allowed"},"value":{"kind":"Variable","name":{"kind":"Name","value":"allowed"}}}]}]}}]} as unknown as DocumentNode<SetLessonAccessMutation, SetLessonAccessMutationVariables>;
export const AssignCourseByEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignCourseByEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignCourseByEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AssignCourseByEmailMutation, AssignCourseByEmailMutationVariables>;
export const ManageModuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ManageModule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CourseModuleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCourseModule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ManageModuleMutation, ManageModuleMutationVariables>;
export const ArchiveModuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveModule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveCourseModule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArchiveModuleMutation, ArchiveModuleMutationVariables>;
export const ReorderModulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderModules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderCourseModules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderedIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ReorderModulesMutation, ReorderModulesMutationVariables>;
export const ReorderLessonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderLessons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderCourseItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderedIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderedIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ReorderLessonsMutation, ReorderLessonsMutationVariables>;
export const ArchiveLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveCourseItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArchiveLessonMutation, ArchiveLessonMutationVariables>;
export const MoveLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetModuleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"position"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveCourseItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetModuleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetModuleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"position"},"value":{"kind":"Variable","name":{"kind":"Name","value":"position"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MoveLessonMutation, MoveLessonMutationVariables>;
export const AddTextLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTextLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTextLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTextLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddTextLessonMutation, AddTextLessonMutationVariables>;
export const EditTextLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditTextLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTextLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTextLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditTextLessonMutation, EditTextLessonMutationVariables>;
export const AddVideoLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddVideoLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVideoLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVideoLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddVideoLessonMutation, AddVideoLessonMutationVariables>;
export const EditVideoLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditVideoLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateVideoLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateVideoLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditVideoLessonMutation, EditVideoLessonMutationVariables>;
export const AddAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAssessmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAssessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddAssessmentMutation, AddAssessmentMutationVariables>;
export const EditAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAssessmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAssessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditAssessmentMutation, EditAssessmentMutationVariables>;
export const AddVideoPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddVideoPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVideoPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVideoPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddVideoPromptMutation, AddVideoPromptMutationVariables>;
export const EditVideoPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditVideoPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateVideoPromptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateVideoPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditVideoPromptMutation, EditVideoPromptMutationVariables>;
export const SetCourseQuestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCourseQuestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthoringQuestionInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setAssessmentQuestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"questions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questions"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetCourseQuestionsMutation, SetCourseQuestionsMutationVariables>;
export const SetCourseOwnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCourseOwner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignCourseOwner"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"ownerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}}]}}]}}]} as unknown as DocumentNode<SetCourseOwnerMutation, SetCourseOwnerMutationVariables>;
export const SetCourseCertificateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCourseCertificate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"certificateEnabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}}]}}]}}]} as unknown as DocumentNode<SetCourseCertificateMutation, SetCourseCertificateMutationVariables>;
export const AssignCourseLearnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignCourseLearner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AssignCourseLearnerMutation, AssignCourseLearnerMutationVariables>;
export const CourseLearnersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseLearners"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseEnrollmentsPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerEmail"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CourseLearnersQuery, CourseLearnersQueryVariables>;
export const CourseLearnerDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseLearnerDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"progress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"watchedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"certificateForEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"certificateNumber"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"verificationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"revokedReason"}}]}}]}}]} as unknown as DocumentNode<CourseLearnerDetailsQuery, CourseLearnerDetailsQueryVariables>;
export const CourseAssessmentReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseAssessmentReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessmentReviewQueuePage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<CourseAssessmentReviewsQuery, CourseAssessmentReviewsQueryVariables>;
export const CourseVideoReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseVideoReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoSubmissionReviewQueuePage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CourseVideoReviewsQuery, CourseVideoReviewsQueryVariables>;
export const CourseAttemptReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseAttemptReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessmentAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentTitle"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"referenceAnswer"}}]}}]}}]}}]} as unknown as DocumentNode<CourseAttemptReviewQuery, CourseAttemptReviewQueryVariables>;
export const GradeCourseAttemptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GradeCourseAttempt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GradeAssessmentAttemptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gradeAssessmentAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}}]}}]}}]} as unknown as DocumentNode<GradeCourseAttemptMutation, GradeCourseAttemptMutationVariables>;
export const CourseSubmissionReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseSubmissionReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoSubmission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"maxDurationSeconds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoSubmissionPlayback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]} as unknown as DocumentNode<CourseSubmissionReviewQuery, CourseSubmissionReviewQueryVariables>;
export const ReviewCourseSubmissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReviewCourseSubmission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewVideoSubmissionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewVideoSubmission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}}]}}]}}]} as unknown as DocumentNode<ReviewCourseSubmissionMutation, ReviewCourseSubmissionMutationVariables>;
export const RevokeCourseCertificateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeCourseCertificate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevokeCertificateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeCertificate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RevokeCourseCertificateMutation, RevokeCourseCertificateMutationVariables>;
export const CourseLessonPlaybackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseLessonPlayback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lessonPlayback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]} as unknown as DocumentNode<CourseLessonPlaybackQuery, CourseLessonPlaybackQueryVariables>;
export const CoursesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CoursesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CourseStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mine"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coursesPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"mine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mine"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CoursesPageQuery, CoursesPageQueryVariables>;
export const CourseDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"course"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"required"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CourseDetailsQuery, CourseDetailsQueryVariables>;
export const CreateCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCourseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateCourseMutation, CreateCourseMutationVariables>;
export const UpdateCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCourseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const PublishCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PublishCourseMutation, PublishCourseMutationVariables>;
export const UnpublishCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnpublishCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unpublishCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UnpublishCourseMutation, UnpublishCourseMutationVariables>;
export const ArchiveCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ArchiveCourseMutation, ArchiveCourseMutationVariables>;
export const CreateCourseModuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCourseModule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CourseModuleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCourseModule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCourseModuleMutation, CreateCourseModuleMutationVariables>;
export const CoursesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Courses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CourseStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mine"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"mine"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mine"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CoursesQuery, CoursesQueryVariables>;
export const CreateLessonDocumentUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLessonDocumentUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LessonFileUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLessonFileUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"publicId"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"apiKey"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}}]}}]}}]}}]} as unknown as DocumentNode<CreateLessonDocumentUploadMutation, CreateLessonDocumentUploadMutationVariables>;
export const FinalizeLessonDocumentUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinalizeLessonDocumentUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeLessonFileUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FinalizeLessonDocumentUploadMutation, FinalizeLessonDocumentUploadMutationVariables>;
export const LessonDocumentAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LessonDocumentAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lessonFileAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LessonDocumentAssetQuery, LessonDocumentAssetQueryVariables>;
export const LessonDocumentPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LessonDocumentPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lessonFilePreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]} as unknown as DocumentNode<LessonDocumentPreviewQuery, LessonDocumentPreviewQueryVariables>;
export const AddFileLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddFileLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFileLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFileLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddFileLessonMutation, AddFileLessonMutationVariables>;
export const EditFileLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditFileLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFileLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFileLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditFileLessonMutation, EditFileLessonMutationVariables>;
export const AddAudioLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAudioLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVideoLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAudioLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddAudioLessonMutation, AddAudioLessonMutationVariables>;
export const EditAudioLessonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditAudioLesson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateVideoLessonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAudioLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditAudioLessonMutation, EditAudioLessonMutationVariables>;
export const MarkLearnerFileReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkLearnerFileRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeFileLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}}]}}]}}]} as unknown as DocumentNode<MarkLearnerFileReadMutation, MarkLearnerFileReadMutationVariables>;
export const AdminEmailMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEmailMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailDeliveryStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEmailMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"purpose"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"providerMessageId"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"bouncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"complainedAt"}}]}}]}}]} as unknown as DocumentNode<AdminEmailMessagesQuery, AdminEmailMessagesQueryVariables>;
export const AdminEmailMessagesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEmailMessagesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EmailDeliveryStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEmailMessagesPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"purpose"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"providerMessageId"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"bouncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"complainedAt"}}]}}]}}]}}]} as unknown as DocumentNode<AdminEmailMessagesPageQuery, AdminEmailMessagesPageQueryVariables>;
export const AdminEmailMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEmailMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEmailMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notificationId"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"providerMessageId"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"bouncedAt"}},{"kind":"Field","name":{"kind":"Name","value":"complainedAt"}}]}}]}}]} as unknown as DocumentNode<AdminEmailMessageQuery, AdminEmailMessageQueryVariables>;
export const MyEnrollmentsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyEnrollmentsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myEnrollmentsPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"learningProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completedRequiredItems"}},{"kind":"Field","name":{"kind":"Name","value":"totalRequiredItems"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"course"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyEnrollmentsPageQuery, MyEnrollmentsPageQueryVariables>;
export const MyEnrollmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyEnrollments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myEnrollments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"learningProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completedRequiredItems"}},{"kind":"Field","name":{"kind":"Name","value":"totalRequiredItems"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"course"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CourseListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CourseListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Course"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyEnrollmentsQuery, MyEnrollmentsQueryVariables>;
export const CourseEnrollmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CourseEnrollments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseEnrollments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CourseEnrollmentsQuery, CourseEnrollmentsQueryVariables>;
export const InvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Invitations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"invitedBy"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedBy"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<InvitationsQuery, InvitationsQueryVariables>;
export const InvitationsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InvitationsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"InvitationStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invitationsPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"invitedBy"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedBy"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<InvitationsPageQuery, InvitationsPageQueryVariables>;
export const CreateInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateInvitationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"invitedBy"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedBy"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"acceptedAt"}},{"kind":"Field","name":{"kind":"Name","value":"revokedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateInvitationMutation, CreateInvitationMutationVariables>;
export const RevokeInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevokeInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revokeInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RevokeInvitationMutation, RevokeInvitationMutationVariables>;
export const LearnerCourseStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearnerCourseState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseOutline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"isLocked"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myCourseEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"learningProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"percentage"}},{"kind":"Field","name":{"kind":"Name","value":"completedRequiredItems"}},{"kind":"Field","name":{"kind":"Name","value":"totalRequiredItems"}}]}},{"kind":"Field","name":{"kind":"Name","value":"progress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"resumePositionSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"watchedPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<LearnerCourseStateQuery, LearnerCourseStateQueryVariables>;
export const LearnerCourseContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearnerCourseContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"course"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"certificateEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"isLocked"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"fileLesson"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"fileAsset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoLesson"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completionThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"videoAssetId"}},{"kind":"Field","name":{"kind":"Name","value":"videoAsset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoPrompt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"maxDurationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"requiresReview"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LearnerCourseContentQuery, LearnerCourseContentQueryVariables>;
export const JoinLearnerCourseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinLearnerCourse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enrollInCourse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<JoinLearnerCourseMutation, JoinLearnerCourseMutationVariables>;
export const MarkLearnerTextReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkLearnerTextRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeTextLesson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<MarkLearnerTextReadMutation, MarkLearnerTextReadMutationVariables>;
export const LearnerLessonPlaybackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearnerLessonPlayback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lessonPlayback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"moduleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]} as unknown as DocumentNode<LearnerLessonPlaybackQuery, LearnerLessonPlaybackQueryVariables>;
export const StartLearnerVideoProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartLearnerVideoProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartVideoProgressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startVideoProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"completionThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"heartbeatIntervalSeconds"}}]}}]}}]} as unknown as DocumentNode<StartLearnerVideoProgressMutation, StartLearnerVideoProgressMutationVariables>;
export const ReportLearnerVideoProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReportLearnerVideoProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordVideoProgressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordVideoProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accepted"}},{"kind":"Field","name":{"kind":"Name","value":"buffered"}}]}}]}}]} as unknown as DocumentNode<ReportLearnerVideoProgressMutation, ReportLearnerVideoProgressMutationVariables>;
export const LearnerAssessmentAttemptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearnerAssessmentAttempt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessmentAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearnerAttemptFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearnerAttemptFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentAttempt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<LearnerAssessmentAttemptQuery, LearnerAssessmentAttemptQueryVariables>;
export const StartLearnerAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartLearnerAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartAssessmentAttemptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startAssessmentAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearnerAttemptFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearnerAttemptFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentAttempt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<StartLearnerAssessmentMutation, StartLearnerAssessmentMutationVariables>;
export const SaveLearnerAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveLearnerAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveAssessmentAnswersInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveAssessmentAnswers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearnerAttemptFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearnerAttemptFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentAttempt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<SaveLearnerAssessmentMutation, SaveLearnerAssessmentMutationVariables>;
export const SubmitLearnerAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitLearnerAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitAssessmentAttemptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitAssessmentAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LearnerAttemptFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LearnerAttemptFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentAttempt"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"passMark"}},{"kind":"Field","name":{"kind":"Name","value":"attemptLimit"}},{"kind":"Field","name":{"kind":"Name","value":"timeLimitSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"maxScore"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deadlineAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"textAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"awardedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<SubmitLearnerAssessmentMutation, SubmitLearnerAssessmentMutationVariables>;
export const StartLearnerSubmissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartLearnerSubmission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoSubmissionUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startVideoSubmission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"upload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"libraryId"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]}}]} as unknown as DocumentNode<StartLearnerSubmissionMutation, StartLearnerSubmissionMutationVariables>;
export const ResumeLearnerSubmissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeLearnerSubmission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshVideoSubmissionUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"upload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"libraryId"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]}}]} as unknown as DocumentNode<ResumeLearnerSubmissionMutation, ResumeLearnerSubmissionMutationVariables>;
export const SyncLearnerSubmissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncLearnerSubmission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncVideoSubmission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}}]}}]}}]} as unknown as DocumentNode<SyncLearnerSubmissionMutation, SyncLearnerSubmissionMutationVariables>;
export const MyVideoAssetsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyVideoAssetsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAssetStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myVideoAssetsPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyVideoAssetsPageQuery, MyVideoAssetsPageQueryVariables>;
export const VideoAssetDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideoAssetDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<VideoAssetDetailsQuery, VideoAssetDetailsQueryVariables>;
export const PreviewLessonVideoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewLessonVideo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewLessonVideo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]} as unknown as DocumentNode<PreviewLessonVideoQuery, PreviewLessonVideoQueryVariables>;
export const CreateLessonVideoUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLessonVideoUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LessonVideoUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLessonVideoUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"libraryId"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateLessonVideoUploadMutation, CreateLessonVideoUploadMutationVariables>;
export const RefreshLessonVideoUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshLessonVideoUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshLessonVideoUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upload"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endpoint"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"libraryId"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"expires"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<RefreshLessonVideoUploadMutation, RefreshLessonVideoUploadMutationVariables>;
export const SyncLessonVideoAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncLessonVideoAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncLessonVideoAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SyncLessonVideoAssetMutation, SyncLessonVideoAssetMutationVariables>;
export const SetLessonVideoThumbnailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetLessonVideoThumbnail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"thumbnailUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setLessonVideoThumbnail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"thumbnailUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"thumbnailUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SetLessonVideoThumbnailMutation, SetLessonVideoThumbnailMutationVariables>;
export const MyVideoAssetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyVideoAssets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myVideoAssets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyVideoAssetsQuery, MyVideoAssetsQueryVariables>;
export const MyNotificationsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotificationsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotificationsPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]} as unknown as DocumentNode<MyNotificationsPageQuery, MyNotificationsPageQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const MyNotificationEmailOptOutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotificationEmailOptOuts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotificationEmailOptOuts"}}]}}]} as unknown as DocumentNode<MyNotificationEmailOptOutsQuery, MyNotificationEmailOptOutsQueryVariables>;
export const SetNotificationEmailEnabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetNotificationEmailEnabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setNotificationEmailEnabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}]}]}}]} as unknown as DocumentNode<SetNotificationEmailEnabledMutation, SetNotificationEmailEnabledMutationVariables>;
export const WorkspaceOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceOverview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishedCourses"}},{"kind":"Field","name":{"kind":"Name","value":"draftCourses"}},{"kind":"Field","name":{"kind":"Name","value":"activeLearners"}},{"kind":"Field","name":{"kind":"Name","value":"totalEnrollments"}},{"kind":"Field","name":{"kind":"Name","value":"completedEnrollments"}},{"kind":"Field","name":{"kind":"Name","value":"pendingReviews"}},{"kind":"Field","name":{"kind":"Name","value":"pendingAssessments"}},{"kind":"Field","name":{"kind":"Name","value":"pendingVideoReviews"}},{"kind":"Field","name":{"kind":"Name","value":"failedVideos"}},{"kind":"Field","name":{"kind":"Name","value":"incompleteDrafts"}},{"kind":"Field","name":{"kind":"Name","value":"pendingInvitations"}},{"kind":"Field","name":{"kind":"Name","value":"emailIssues"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"recentCourses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"draftsNeedingWork"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessmentReviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoReviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"courseId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"failedVideoItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceOverviewQuery, WorkspaceOverviewQueryVariables>;
export const UsersPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"disabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UsersPageQuery, UsersPageQueryVariables>;
export const SetUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetUserRoleMutation, SetUserRoleMutationVariables>;
export const SetUserDisabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserDisabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserDisabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"disabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"disabled"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SetUserDisabledMutation, SetUserDisabledMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"disabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const PlatformHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"}}]}}]} as unknown as DocumentNode<PlatformHealthQuery, PlatformHealthQueryVariables>;
export const VideoSubmissionReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideoSubmissionReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoSubmissionReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"courseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"courseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"learnerName"}},{"kind":"Field","name":{"kind":"Name","value":"learnerAvatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<VideoSubmissionReviewQueueQuery, VideoSubmissionReviewQueueQueryVariables>;
export const MyVideoSubmissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyVideoSubmissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myVideoSubmissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"enrollmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enrollmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enrollmentId"}},{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"promptTitle"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"maxDurationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"requiresReview"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"failureCode"}},{"kind":"Field","name":{"kind":"Name","value":"feedback"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedBy"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"asset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VideoAssetListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VideoAssetListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VideoAsset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"durationSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"sizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MyVideoSubmissionsQuery, MyVideoSubmissionsQueryVariables>;