import { Employee } from '../types/Employee'
import { apiEndpoint } from '../config'
import { CreateEmployeeRequest } from '../types/CreateEmployeeRequest'
import { UpdateEmployeeRequest } from '../types/UpdateEmployeRequest'
import { EmployeeCreatedResponse } from '../types/EmployeeCreatedResponse'
import Axios from 'axios'

export async function getEmployees(idToken: string, departmentId: string): Promise<Employee[]> {
  console.log('Fetching employees')

  console.log(idToken)
  const response = await Axios.get(`${apiEndpoint}/departments/${departmentId}/employees?limit=10`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })

  return response.data.items
}

export async function createEmployee(
  idToken: string,
  newTodo: CreateEmployeeRequest
): Promise<EmployeeCreatedResponse> {
  const response = await Axios.post(`${apiEndpoint}/employees`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data
}

export async function patchEmployee(
    idToken: string,
    employeeId: string,
    updatedTodo: UpdateEmployeeRequest
  ): Promise<void> {
    await Axios.patch(`${apiEndpoint}/employees/${employeeId}`, JSON.stringify(updatedTodo), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
  }
  
  export async function deleteEmployee(
    idToken: string,
    employeeId: string
  ): Promise<void> {
    await Axios.delete(`${apiEndpoint}/employees/${employeeId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
  }
  
  export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
    await Axios.put(uploadUrl, file)
  }