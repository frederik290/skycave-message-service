// import {v4 as uuid} from 'uuid';
// import AWS from 'aws-sdk';
// import createError from 'http-errors';
// import createAuctionsSchema from '../lib/schemas/createAuctionSchema';
// import validator from '@middy/validator';
import commonMiddelware from '../lib/commonMiddelware';

//const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createMessage(event, context){
    const { position } = event.pathParameters;
    return {
        statusCode: 201,
        body: JSON.stringify({position: position}),
    };
}

//TODO: use schema validation
export const handler = commonMiddelware(createMessage);
