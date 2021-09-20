import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { createDepartment } from '../../helpers/businessLogic/departments'

import { CreateDepartmentRequest } from '../../models/requests/CreateDepartmentRequest'

const logger = createLogger('departments')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)
  
    const newDepartment: CreateDepartmentRequest = JSON.parse(event.body)
    logger.info(`new department: ${newDepartment}`)
    //console.log(newDepartment)
  
    const authorization = event.headers.Authorization
      const split = authorization.split(' ')
      const jwtToken = split[1]
  
    const newItem = await createDepartment(newDepartment, jwtToken)
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  })
  
  handler.use(httpErrorHandler()).use(
    cors({
      credentials: true
    })
  )