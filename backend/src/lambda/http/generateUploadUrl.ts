import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {
  getUserIdByToken,
  getEmployee,
  getPresignedUrl,
  updateEmployeeWithUrl
} from '../../helpers/businessLogic/employees'

const logger = createLogger('employees')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const employeeId = event.pathParameters.employeeId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    if (!employeeId) {
      logger.error(`Invalid employee with id: ${employeeId}`)
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

    const employee = await getEmployee(employeeId, userId)
    

    if (Object.keys(employee).length === 0) {
      logger.error(
        `user with id: ${userId} is attempting to generate upload url for a non-existent employee with id ${employeeId}`
      )
      return {
        statusCode: 400,
        body: JSON.stringify({
          errorMessage: 'todo item does not exist',
          input: event
        })
      }
    }

    if (employee.userId !== userId) {
      logger.error(
        `employee with id ${employeeId} was created by a different user and not by user with id ${userId}`
      )
      return {
        statusCode: 400,
        body: JSON.stringify({
          errorMessage: 'todo item was not created by user',
          input: event
        })
      }
    }

    const uploadUrl = await getPresignedUrl(employeeId)
    await updateEmployeeWithUrl(userId, employeeId, uploadUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: uploadUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
