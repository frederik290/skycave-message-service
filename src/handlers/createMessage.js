import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import createMessageSchema from '../lib/schemas/createMessageSchema';
import validator from '@middy/validator';
import commonMiddelware from '../lib/commonMiddelware';
import constants from '../lib/constants';
import {getMessagesWithLargestIndexFromPosition} from './getMessage';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createMessage(event, context){
    const newMessage = await createMessageObject(event);

    try {
        await dynamodb.put({
            TableName: process.env.MESSAGE_TABLE_NAME,
            Item: newMessage,
        }).promise();
    } catch(error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: JSON.stringify({
            location: `${constants.GET_MESSAGE_PATH}/${newMessage.id}`,
        }),
    };
}

async function createMessageObject(event){
    const { position } = event.pathParameters;
    const { creatorId, creatorName, contents } = event.body;
    const now = new Date();
    let positionIndex = 0;
    let messagesFromDb = await getMessagesWithLargestIndexFromPosition(position);

    if(messagesFromDb.length > 0){
        let message = messagesFromDb[0];
        positionIndex = message.positionIndex + 1;
    }

    const message = {
        id: uuid(),
        creatorId,
        creatorName,
        contents,
        position,
        creatorTimeStampISO8601: now.toISOString(),
        positionIndex,
    };
    return message;
}

export const handler = commonMiddelware(createMessage)
    .use(validator({inputSchema: createMessageSchema}));