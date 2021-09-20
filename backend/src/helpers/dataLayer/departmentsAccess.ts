import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Department } from "../../models/data/Department";
import { DepartmentUpdate } from "../../models/data/DepartmentUpdate";
import { createLogger } from "../../utils/logger";

const logger = createLogger("data-layer");

const XAWS = AWSXRay.captureAWS(AWS);

export class DepartmentsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly departmentsTable = process.env.DEPARTMENTS_TABLE
  ) {}

  async getDepartment(
    departmentId: string,
    userId: string
  ): Promise<Department> {
    const result = await this.docClient
      .query({
        TableName: this.departmentsTable,
        KeyConditionExpression:
          "departmentId = :departmentId AND userId = :userId",
        ExpressionAttributeValues: {
          ":departmentId": departmentId,
          ":userId": userId,
        },
      })
      .promise();

    return result.Items[0] as Department;
  }

  async getDepartments(
    userId: string,
    limit: number,
    nextKey: any
  ): Promise<any> {
    logger.info(`Getting all departments for user ${userId}`);

    console.log(nextKey);

    let result: any;

    if (nextKey !== null) {
      result = await this.docClient
        .query({
          TableName: this.departmentsTable,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
          ScanIndexForward: true,
          Limit: limit,
          ExclusiveStartKey: {
            userId: nextKey.userId,
            departmentId: nextKey.departmentId,
          },
        })
        .promise();
    } else {
      result = await this.docClient
        .query({
          TableName: this.departmentsTable,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
          ScanIndexForward: true,
          Limit: limit
        })
        .promise();
    }
    //const items = result.Items;

    return result;
  }

  async createDepartment(department: Department): Promise<Department> {
    await this.docClient
      .put({
        TableName: this.departmentsTable,
        Item: department,
      })
      .promise();

    return department;
  }

  async updateDepartment(
    userId: string,
    departmentId: string,
    updateDepartment: DepartmentUpdate
  ): Promise<DepartmentUpdate> {
    await this.docClient
      .update({
        TableName: this.departmentsTable,
        Key: { userId, departmentId },
        ExpressionAttributeNames: { "#N": "name" },
        UpdateExpression:
          "set #N=:departmentName, description=:description",
        ExpressionAttributeValues: {
          ":departmentName": updateDepartment.name,
          ":description": updateDepartment.description,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();

    return updateDepartment;
  }

  async deleteDepartment(departmentId: string, userId: string) {
    const param = {
      TableName: this.departmentsTable,
      Key: {
        userId: userId,
        departmentId: departmentId,
      },
    };
    await this.docClient.delete(param).promise();
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    AWSXRay.setContextMissingStrategy("LOG_ERROR");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
