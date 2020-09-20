import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getMessages(event, context){
    let messages;

    try {
        const result = await dynamodb.scan({
            TableName: process.env.MESSAGE_TABLE_NAME
        }).promise();
        messages = result.Items;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(messages),
    };
}


export const handler = commonMiddelware(getMessages);