import type { MyCertificatesQuery } from "../../src/generated/graphql"

export {
  MyCertificatesDocument as MY_CERTIFICATES_QUERY,
  CertificateForEnrollmentDocument as CERTIFICATE_FOR_ENROLLMENT_QUERY,
} from "../../src/generated/graphql"
export type {
  CertificateStatus,
  MyCertificatesQuery as MyCertificatesQueryResult,
  MyCertificatesQueryVariables,
  CertificateForEnrollmentQuery as CertificateForEnrollmentQueryResult,
  CertificateForEnrollmentQueryVariables,
} from "../../src/generated/graphql"
export type CertificateListItem = MyCertificatesQuery["myCertificates"][number]
