const schema = {
    properties: {
        body: {
            type: 'object',
            properties: {
                creatorId: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 50,
                },
                creatorName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 50,
                },
                contents: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                },
            },
            required: [
                'creatorId',
                'creatorName',
                'contents'
            ],
        },
        pathParameters: {
            type: 'object',
            properties: {
                position: {
                    type: 'string',
                    pattern: '^\\([0-9]{1,5},[0-9]{1,5},[0-9]{1,5}\\)$'
                }
            },
            required: ['position']
        },
    },
    required: ['body', 'pathParameters'],
};

export default schema;


