const infoMessage = 'This is version 1 of the message service. Enjoy!';

async function getInfo(event, context){
    return {
        statusCode: 200,
        body: JSON.stringify({message: infoMessage}),
    };
}

export const handler = getInfo;