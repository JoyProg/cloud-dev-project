import { Department } from '../types/Department'
import { apiEndpoint } from '../config'
import { CreateDepartmentRequest } from '../types/CreateDepartmentRequest'
import { UpdateDepartmentRequest } from '../types/UpdateDepartmentReuqest'
import Axios from 'axios'

export async function getDepartments(idToken: string): Promise<Department[]> {
  console.log('Fetching departments')

  const response = await Axios.get(`${apiEndpoint}/departments?limit=10`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log(response)
  return response.data.items
}

export async function createDepartment(
  idToken: string,
  newTodo: CreateDepartmentRequest
): Promise<Department> {
  const response = await Axios.post(`${apiEndpoint}/departments`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchDepartment(
    idToken: string,
    departmentId: string,
    updatedTodo: UpdateDepartmentRequest
  ): Promise<void> {
    await Axios.patch(`${apiEndpoint}/departments/${departmentId}`, JSON.stringify(updatedTodo), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
  }
  
  export async function deleteDepartment(
    idToken: string,
    departmentId: string
  ): Promise<void> {
    await Axios.delete(`${apiEndpoint}/departments/${departmentId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
  }