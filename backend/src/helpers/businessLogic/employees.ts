import { Employee } from '../../models/data/Employee'
import { EmployeeUpdate } from '../../models/data/EmployeeUpdate'
import { EmployeesAccess } from '../dataLayer/employeesAccess'
import { AttachmentAccess } from '../s3/attachmentUtils'
import { parseUserId } from '../../auth/utils'
import { CreateEmployeeRequest } from '../../models/requests/CreateEmployeeRequest'
import { UpdateEmployeeRequest } from '../../models/requests/UpdateEmployeeRequest'
import * as uuid from 'uuid'

const employeesAccess = new EmployeesAccess()
const attachmentAccess = new AttachmentAccess()

export async function getEmployee(employeeId: string, userId: string): Promise<Employee> {
    return await employeesAccess.getEmployee(employeeId, userId)
  }
  
  export async function getEmployees(jwtToken: string, departmentId: string, limit: number, nextKey: any): Promise<any> {
    const userId = parseUserId(jwtToken)
    return await employeesAccess.getEmployees(userId, departmentId, limit, nextKey)
  }
  
  export async function getUserIdByToken(jwtToken: string): Promise<string> {
    return parseUserId(jwtToken)
  }
  
  export async function createEmployee(
    createEmployeeRequest: CreateEmployeeRequest,
    userId: string
  ): Promise<Employee> {
  
    const employeeId = uuid.v4()
  
    return await employeesAccess.createEmployee({
      userId: userId,
      employeeId: employeeId,
      name: createEmployeeRequest.name,
      departmentId: createEmployeeRequest.departmentId,
      employmentDate: createEmployeeRequest.employmentDate,
      attachmentUrl: ''
    })
  }
  
  export async function updateEmployee(
    updateTodoRequest: UpdateEmployeeRequest,
    userId: string, employeeId: string
  ): Promise<EmployeeUpdate> {
    return await employeesAccess.updateEmployee(userId, employeeId, {
      name: updateTodoRequest.name,
      department: updateTodoRequest.employmentDate,
      employmentDate: updateTodoRequest.employmentDate
    })
  }
  
  export async function deleteEmployee(employeeId: string, userId: string) {   
      return await employeesAccess.deleteEmployee(employeeId, userId)
  }
  
  export async function getPresignedUrl(employeeId: string): Promise<string>{
    return await attachmentAccess.getPresignedUrl(employeeId)
  }
  
  export async function updateEmployeeWithUrl(userId: string, employeeId: string,  uploadUrl: string): Promise<string>{
    return await employeesAccess.updateEmployeeWithUrl(userId, employeeId, uploadUrl)
  }