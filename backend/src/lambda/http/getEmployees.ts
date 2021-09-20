import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getEmployees } from '../../helpers/businessLogic/employees'

const logger = createLogger('employees')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const departmentId = event.pathParameters.departmentId;
    
    let nextKey;
    let limit;

    try {
      // Parse query parameters
      nextKey = parseNextKeyParameter(event);
      limit = parseLimitParameter(event) || 20;
    } catch (e) {
      console.log("Failed to parse query parameters: ", e.message);
      return {
        statusCode: 400,
        body: JSON.stringify({
          errorMessage: "Invalid parameters",
        }),
      };
    }

    const result = await getEmployees(jwtToken, departmentId, limit, nextKey)

    console.log(result)

    if (result.length !== 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: result.Items,
          nextKey: encodeNextKey(result.LastEvaluatedKey)
        })
      }
    }

  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

function parseLimitParameter(event) {
  const limitStr = getQueryParameter(event, "limit");
  if (!limitStr) {
    return undefined;
  }

  const limit = parseInt(limitStr, 10);
  if (limit <= 0) {
    throw new Error("Limit should be positive");
  }

  return limit;
}

function parseNextKeyParameter(event) {
  const nextKeyStr = getQueryParameter(event, "nextKey");
  if (!nextKeyStr) {
    return null;
  }

  const uriDecoded = decodeURIComponent(nextKeyStr);
  return JSON.parse(uriDecoded);
}

function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters;
  if (!queryParams) {
    return undefined;
  }

  return queryParams[name];
}

function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null;
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}