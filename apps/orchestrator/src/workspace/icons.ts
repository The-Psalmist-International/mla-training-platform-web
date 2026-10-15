import type { Icon } from "@phosphor-icons/react"
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House"
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar"
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell"
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen"
import { FilmStripIcon } from "@phosphor-icons/react/dist/csr/FilmStrip"
import { StudentIcon } from "@phosphor-icons/react/dist/csr/Student"
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText"
import { VideoCameraIcon } from "@phosphor-icons/react/dist/csr/VideoCamera"
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users"
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple"
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate"
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt"
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle"
import type { WorkspaceView } from "./navigation"

export const workspaceIcons = {
  overview: HouseIcon,
  analytics: ChartBarIcon,
  notifications: BellIcon,
  courses: BookOpenIcon,
  videos: FilmStripIcon,
  enrollments: StudentIcon,
  assessments: ClipboardTextIcon,
  submissions: VideoCameraIcon,
  people: UsersIcon,
  invitations: EnvelopeSimpleIcon,
  certificates: CertificateIcon,
  delivery: PaperPlaneTiltIcon,
  account: UserCircleIcon,
} satisfies Record<WorkspaceView, Icon>
