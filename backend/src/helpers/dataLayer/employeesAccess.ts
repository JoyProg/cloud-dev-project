import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Employee } from '../../models/data/Employee'
import { EmployeeUpdate } from '../../models/data/EmployeeUpdate'
import { createLogger } from '../../utils/logger'

const logger = createLogger('data-layer')

const XAWS = AWSXRay.captureAWS(AWS)

export class EmployeesAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly employeesTable = process.env.EMPLOYEES_TABLE,
        private readonly employmentDateIndex = process.env.EMPLOYMENT_DATE_INDEX
      ) {}

      async getEmployee(employeeId: string, userId: string): Promise<Employee> {
        const result = await this.docClient.query({
             TableName: this.employeesTable,
             KeyConditionExpression: 'employeeId = :employeeId AND userId = :userId',
             ExpressionAttributeValues: {
                 ':employeeId': employeeId,
                 ':userId': userId
             }
         }).promise()
         
         return result.Items[0] as Employee
     }
     
       async getEmployees(userId: string, departmentId: string, limit: number, nextKey: any): Promise<any> {
         logger.info(`Getting all employees for user ${userId}`)

         console.log(nextKey)

         let result: any;


        if(nextKey !== null){
          result = await this.docClient
           .query({
             TableName: this.employeesTable,
             IndexName: this.employmentDateIndex,
             KeyConditionExpression: 'userId = :userId',
             FilterExpression: 'departmentId = :departmentId',
             ExpressionAttributeValues: {
               ':userId': userId,
               ':departmentId': departmentId
             },
             ScanIndexForward: true, 
             Limit: limit,
             ExclusiveStartKey: {
              "userId": nextKey.userId,
              "employeeId": nextKey.employeeId,
              "employmentDate": nextKey.employmentDate
            }   
           })
           .promise()
        }
        else{
          result = await this.docClient
           .query({
             TableName: this.employeesTable,
             IndexName: this.employmentDateIndex,
             KeyConditionExpression: 'userId = :userId',
             FilterExpression: 'departmentId = :departmentId',
             ExpressionAttributeValues: {
               ':userId': userId,
               ':departmentId': departmentId
             },
             ScanIndexForward: true, 
             Limit: limit  
           })
           .promise()
        }
          
         //const items = result.Items
     
         return result
       }
     
       async createEmployee(employee: Employee): Promise<Employee> {
         await this.docClient
           .put({
             TableName: this.employeesTable,
             Item: employee
           })
           .promise()
     
         return employee
       }
     
       async updateEmployee(userId: string, employeeId: string, updateEmployee: EmployeeUpdate): Promise<EmployeeUpdate> {
         
         await this.docClient.update({
           TableName: this.employeesTable,
           Key: { userId, employeeId },
           ExpressionAttributeNames: { "#N": "name" },
           UpdateExpression: "set #N=:employeeName, employmentDate=:employmentDate", 
           ExpressionAttributeValues: {
             ":employeeName": updateEmployee.name,
             ":employmentDate": updateEmployee.employmentDate
           },
           ReturnValues: "UPDATED_NEW"
         })
         .promise();
         
         return updateEmployee
       }
     
       async deleteEmployee(employeeId: string, userId: string) {
         const param = {
             TableName: this.employeesTable,
             Key: {
                 "userId": userId,
                 "employeeId": employeeId
             }
         }
         await this.docClient.delete(param).promise()
       }
     
       async updateEmployeeWithUrl(userId: string, employeeId: string, uploadUrl: string): Promise<string>{
         await this.docClient.update({
           TableName: this.employeesTable,
           Key: { userId, employeeId },
           UpdateExpression: "set attachmentUrl=:URL",
           ExpressionAttributeValues: {
             ":URL": uploadUrl.split("?")[0]
         },
         ReturnValues: "UPDATED_NEW"
         })
         .promise();
     
         return uploadUrl
       }
    
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    AWSXRay.setContextMissingStrategy('LOG_ERROR')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
