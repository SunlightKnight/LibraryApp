// API error interface, as described in API specifications.
export interface BackendError {
  status: number
  messageKey: string
  message: string
  errorDetails?: Array<BackendErrorDetails>
}

export interface BackendErrorDetails {
  fieldName: string
  fieldValue: string
  messageKey: string
  message: string
}

export const throwError = (error: BackendError) => {
  throw error
}