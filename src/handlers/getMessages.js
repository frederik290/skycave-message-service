import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';
import constants from '../lib/constants';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getMessages(event, context){
    let {position, startIndex, pageSize} = event.pathParameters;
    const input = {position, startIndex, pageSize};
    let messages;

    if(!pageSize) pageSize = 3;
    console.log(`input=${JSON.stringify(input)}`);

    const params = {
        TableName: constants.MESSAGE_TABLE_NAME,
        IndexName: constants.POSITION_AND_CREATOR_INDEX_NAME,
        ScanIndexForward: false,
        KeyConditionExpression: '#position = :position',
        ExpressionAttributeValues: {':position': position},
        ExpressionAttributeNames: {'#position': 'position'},
        Limit: pageSize,
    };

    console.log(`params=${JSON.stringify(params)}`);

    const count = await getNumberOfMessageForPosition(position);
    console.log(`Found ${count} items for position ${position}`);

    try {
        const result = await dynamodb.query(params).promise();
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

async function getNumberOfMessageForPosition(position){
    const countParams = {
        TableName: constants.MESSAGE_TABLE_NAME,
        IndexName: constants.POSITION_AND_CREATOR_INDEX_NAME,
        ScanIndexForward: false,
        KeyConditionExpression: '#position = :position',
        ExpressionAttributeValues: {':position': position},
        ExpressionAttributeNames: {'#position': 'position'},
        Select: 'COUNT',
    };
    try {
        const countResult = await dynamodb.query(countParams).promise();
        return countResult.Count;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
}


export const handler = commonMiddelware(getMessages);