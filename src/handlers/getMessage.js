import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';
import constants from '../lib/constants';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getMessageById(id){
    let message;

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
        throw new createError.NotFound(`Message with id ${id} not found.`);
    }
   return message;
}

export async function getMessagesWithLargestIndexFromPosition(position){
    console.log(`inside 2`);
    let messages;
    let params = {
        TableName: process.env.MESSAGE_TABLE_NAME,
        IndexName: constants.POSITION_INDEX,
        KeyConditionExpression: '#position = :position',
        ExpressionAttributeValues: {':position': position},
        ExpressionAttributeNames: {'#position': 'position'},
        Limit: 1,
        ScanIndexForward: false,
    };
    try {
        const result = await dynamodb.query(params).promise();
        messages = result.Items;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
   return messages;
}

async function getMessage(event, context){
    const { id } = event.pathParameters;
    const message = await getMessageById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(message),
    };
}


export const handler = commonMiddelware(getMessage);


