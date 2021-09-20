import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { createEmployee, getPresignedUrl, updateEmployeeWithUrl, getUserIdByToken } from '../../helpers/businessLogic/employees'
import { CreateEmployeeRequest } from '../../models/requests/CreateEmployeeRequest'
const logger = createLogger('employees')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)
  
    const newEmployee: CreateEmployeeRequest = JSON.parse(event.body)
    logger.info(`new employee: ${newEmployee}`)
    //console.log(newEmployee)
  
    const authorization = event.headers.Authorization
      const split = authorization.split(' ')
      const jwtToken = split[1]
      const userId = await getUserIdByToken(jwtToken)
  
    const newItem = await createEmployee(newEmployee, userId)

    const uploadUrl = await getPresignedUrl(newItem.employeeId)
    await updateEmployeeWithUrl(userId, newItem.employeeId, uploadUrl)
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        newItem: newItem,
        uploadUrl: uploadUrl
      })
    }
  })
  
  handler.use(httpErrorHandler()).use(
    cors({
      credentials: true
    })
  )