import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserIdByToken, getDepartment, updateDepartment } from '../../helpers/businessLogic/departments'

import { UpdateDepartmentRequest } from '../../models/requests/UpdateDepartmentRequest'

const logger = createLogger('departments')

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const departmentId = event.pathParameters.departmentId
  const updatedDepartment: UpdateDepartmentRequest = JSON.parse(event.body)

  if(!departmentId){
    logger.error(`Invalid department with id: ${departmentId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'Invalid id'
          })
    }
  } 
   
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = await getUserIdByToken(jwtToken)

  const department = await getDepartment(departmentId, userId)
  

  if(Object.keys(department).length === 0){
    logger.error(`user with id: ${userId} is attempting to update a non-existent department with id ${departmentId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'todo item does not exist',
            input: event,
        })
    }
  }

  if(department.userId !== userId){
    logger.error(`department with id ${departmentId} was created by a different user and not by user with id ${userId}`)
    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentialls': true,
        },
        body: JSON.stringify({
            errorMessage: 'department was not created by user'
        })
    }
  }

  const updatedItem = await updateDepartment(updatedDepartment, userId, departmentId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      updatedItem: updatedItem
    })
  }
})

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
