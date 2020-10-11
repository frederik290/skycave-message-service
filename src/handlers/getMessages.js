import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';
import constants from '../lib/constants';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getMessages(event, context){
    let {position, startIndex, pageSize} = event.pathParameters;
    let messages;
    if(!pageSize) pageSize = 3;
    let si = Number(startIndex);
    let ps = Number(pageSize);

    const count = await getNumberOfMessageForPosition(position);
    const firstIndex = si > count ? count : si;
    const lastIndex = si + ps > count ? count : si + ps;
    const params = getQueryParams(position, pageSize, firstIndex, lastIndex);

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

function getQueryParams(position, pageSize, firstIndex, lastIndex){
    const params = {
        TableName: constants.MESSAGE_TABLE_NAME,
        IndexName: constants.POSITION_INDEX,
        KeyConditionExpression: '#position = :position and #positionIndex BETWEEN :firstIndex and :lastIndex',
        ExpressionAttributeValues: {
            ':position': position,
            ':firstIndex': firstIndex,
            ':lastIndex': lastIndex,
        },
        ExpressionAttributeNames: {
            '#position': 'position',
            '#positionIndex': 'positionIndex',
        },
        Limit: pageSize,
    };

    console.log(`params=${JSON.stringify(params)}`);
    return params;
}

async function getNumberOfMessageForPosition(position){
    const params = {
        TableName: constants.MESSAGE_TABLE_NAME,
        IndexName: constants.POSITION_AND_CREATOR_INDEX_NAME,
        ScanIndexForward: false,
        KeyConditionExpression: '#position = :position',
        ExpressionAttributeValues: {':position': position,},
        ExpressionAttributeNames: {'#position': 'position'},
        Select: 'COUNT',
    };
    try {
        const countResult = await dynamodb.query(params).promise();
        console.log(`Found ${countResult.Count} items for position ${position}`);
        return countResult.Count;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
}


export const handler = commonMiddelware(getMessages);