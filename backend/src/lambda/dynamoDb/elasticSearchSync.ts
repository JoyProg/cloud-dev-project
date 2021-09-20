import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { createLogger } from '../../utils/logger';
import * as elasticsearch from 'elasticsearch';
import * as httpAwsEs from 'http-aws-es';

const logger = createLogger('stream')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info(`Processing events batch from DynamoDB`, JSON.stringify(event))
    //console.log(`Processing events batch from DynamoDB`, JSON.stringify(event))

    for (const record of event.Records) {
        logger.info(`Processing record`, JSON.stringify(record))

        if (record.eventName !== 'INSERT') {
            continue
          }
      
          const newItem = record.dynamodb.NewImage
      
          const employeeId = newItem.employeeId.S
      
          const body = {
            employeeId: newItem.employeeId.S,
            userId: newItem.userId.S,
            name: newItem.name.S,
            employmentDate: newItem.employmentDate.S,
            department: newItem.department.B,
            createdAt: newItem.createdAt.S,
            attachmentUrl: newItem.attachmentUrl.S
          }
    
          await es.index({
            index: 'employees-index',
            type: 'text',
            id: employeeId,
            body
          })
      
    }
}