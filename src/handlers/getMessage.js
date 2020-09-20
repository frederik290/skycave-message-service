import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getMessage(event, context){
    let message;
    const { id } = event.pathParameters;

    try {
        const result = await dynamodb.get({
            TableName: process.env.MESSAGE_TABLE_NAME,
            Key: { id },
        }).promise();

        message = result.Item;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    if(!message){
        throw new createError.NotFound(`Message with id ${id} not found..`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(message),
    };
}


export const handler = commonMiddelware(getMessage);


