import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';
import constants from '../lib/constants';
import { getMessageById } from './getMessage';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateMessage(event, context){
    const {creatorId, contents} = event.body;
    const {id} = event.pathParameters;
    const input = {id, creatorId, contents};
    const message = await getMessageById(id);
    const updateAllowed = creatorId === message.creatorId;

    console.log(`input=${JSON.stringify(input)}, message.creatorId=${message.creatorId}`);

    if(!updateAllowed)
        throw new createError.Forbidden(`Creator with id ${creatorId} is not allowed to update message with id ${id}`);

    const params = {
        TableName: constants.MESSAGE_TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set #contents = :contents',
        ExpressionAttributeNames: {'#contents': 'contents'},
        ExpressionAttributeValues: {':contents': contents},
    };

    console.log(`operation=UpdateMessage, params=${JSON.stringify(params)}`);

    try {
        await dynamodb.update(params).promise();
    } catch(error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {statusCode: 204};
}

//TODO: create schema for update message
export const handler = commonMiddelware(updateMessage);
