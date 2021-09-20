import { Department } from '../../models/data/Department'
import { DepartmentUpdate } from '../../models/data/DepartmentUpdate'
import { DepartmentsAccess } from '../dataLayer/departmentsAccess'
import { AttachmentAccess } from '../s3/attachmentUtils'
import { parseUserId } from '../../auth/utils'
import { CreateDepartmentRequest } from '../../models/requests/CreateDepartmentRequest'
import { UpdateDepartmentRequest } from '../../models/requests/UpdateDepartmentRequest'
import * as uuid from 'uuid'

const departmentsAccess = new DepartmentsAccess()
const attachmentAccess = new AttachmentAccess()

export async function getDepartment(departmentId: string, userId: string): Promise<Department> {
    return await departmentsAccess.getDepartment(departmentId, userId)
  }
  
  export async function getDepartments(jwtToken: string, limit: number, nextKey: any): Promise<any> {
    const userId = parseUserId(jwtToken)
    return await departmentsAccess.getDepartments(userId, limit, nextKey)
  }
  
  export async function getUserIdByToken(jwtToken: string): Promise<string> {
    return parseUserId(jwtToken)
  }
  
  export async function createDepartment(
    createDepartmentRequest: CreateDepartmentRequest,
    jwtToken: string
  ): Promise<Department> {
  
    const userId = parseUserId(jwtToken)
    const departmentId = uuid.v4()
  
    return await departmentsAccess.createDepartment({
      userId: userId,
      departmentId: departmentId,
      name: createDepartmentRequest.name,
      description: createDepartmentRequest.description
    })
  }
  
  export async function updateDepartment(
    updateTodoRequest: UpdateDepartmentRequest,
    userId: string, departmentId: string
  ): Promise<DepartmentUpdate> {
    return await departmentsAccess.updateDepartment(userId, departmentId, {
      name: updateTodoRequest.name,
      description: updateTodoRequest.description
    })
  }
  
  export async function deleteDepartment(departmentId: string, userId: string) {   
      return await departmentsAccess.deleteDepartment(departmentId, userId)
  }
  
  export async function getPresignedUrl(departmentId: string): Promise<string>{
    return await attachmentAccess.getPresignedUrl(departmentId)
  }