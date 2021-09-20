import { Employee } from './Employee'

export interface EmployeeCreatedResponse {
  newItem: Employee
  uploadUrl: string
}