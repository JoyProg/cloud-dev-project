import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserIdByToken, getDepartment, deleteDepartment } from '../../helpers/businessLogic/departments'

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const departmentId = event.pathParameters.departmentId

  if(!departmentId){
    logger.error(`Invalid department with id: ${departmentId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'Invalid id',
            input: event 
          })
    }
  } 

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = await getUserIdByToken(jwtToken)

  const todoItem = await getDepartment(departmentId, userId)

  if(Object.keys(todoItem).length === 0){
    logger.error(`user with id: ${userId} is attempting to delete a non-existent department with id ${departmentId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'department does not exist',
            input: event,
        })
    }
  }

  if(todoItem.userId !== userId){
    logger.error(`department with id ${departmentId} was created by a different user and not by user with id ${userId}`)
    return {
        statusCode: 400,
        body: JSON.stringify({
            errorMessage: 'department was not created by user',
            input: event,
        })
    }
  }

  await deleteDepartment(departmentId, userId) 
  return {
    statusCode: 204,
    body: JSON.stringify({
      input: event,
    })
  }
})

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)