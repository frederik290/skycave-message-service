import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddelware from '../lib/commonMiddelware';
import CONSTANTS from '../lib/constants';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getMessages(event, context){
    let {position, startIndex, pageSize} = event.pathParameters;
    let messages;
    if(!pageSize) pageSize = 3;
    let si = Number(startIndex);
    let ps = Number(pageSize);

    const count = await getNumberOfMessageForPosition(position);
    const firstIndex = si > count ? count : si;
    const lastIndex = (si + ps -1) > count ? count : (si + ps -1);


    const params = getQueryParams(position, firstIndex, lastIndex);

    try {
        const result = await dynamodb.query(params).promise();
        messages = result.Items.map(dbItemToMessage);
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(messages),
    };
}


function dbItemToMessage(dbItem){
    return  {
        creatorTimeStampISO8601: dbItem.creatorTimeStampISO8601,
        creatorName: dbItem.creatorName,
        contents: dbItem.contents,
        id: dbItem.id,
        position: dbItem.position,
        creatorId: dbItem.creatorId
    };
}


function getQueryParams(position, firstIndex, lastIndex){
    const exp = '#position = :position and '
              + 'positionIndex BETWEEN :firstIndex and :lastIndex';

    const params = {
        TableName: CONSTANTS.MESSAGE_TABLE_NAME,
        IndexName: CONSTANTS.POSITION_INDEX,
        KeyConditionExpression: exp,
        ExpressionAttributeValues: {
            ':position': position,
            ':firstIndex': firstIndex,
            ':lastIndex': lastIndex,
        },
        ExpressionAttributeNames: {
            '#position': 'position',
        },
    };

    console.log(`params=${JSON.stringify(params)}`);
    return params;
}

async function getNumberOfMessageForPosition(position){
    const params = {
        TableName: CONSTANTS.MESSAGE_TABLE_NAME,
        IndexName: CONSTANTS.POSITION_AND_CREATOR_INDEX_NAME,
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