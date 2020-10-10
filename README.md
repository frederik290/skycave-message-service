# skycave-message-service
This is an AWS serverless port of the SkyCave MessageService microservice for the AU MsDO exam project. 

## API 

```
MessageService
==============

Create new message
-------------------

POST /createMessage/{position}

{
    "creatorId": "string",
    "creatorName": "string",
    "contents": "string"
}

creatorId: Max length 50
creatorName: Max length 50
contents: Max length 100
position: Min length 1, Max length 5 (for each coordinate)

Response
Status: 201 Created
Location: /getMessage/{id}
(none)

Status: 400 Bad Request
(none)

Get message
------------

GET /getMessage/{id}

Response
Status: 200 OK
{
    "id": "string",
    "creatorId": "string",
    "creatorName": "string",
    "contents": "string",
    "position": "string",
    "creatorTimeStampISO8601": "string"
}

Status: 404 Not found
(none)

Get messages
------------

GET /getMessages/{position}/{startIndex}/{pageSize}
pageSize: Optional, default 3, limit: 1 - 50
startIndex: Required, limit: 0-1000

Response
Status: 200 OK
[
{
    "id": "string",
    "creatorId": "string",
    "creatorName": "string",
    "contents": "string",
    "position": "string",
    "creatorTimeStampISO8601": "string"
},
{
    "id": "string",
    "creatorId": "string",
    "creatorName": "string",
    "contents": "string",
    "position": "string",
    "creatorTimeStampISO8601": "string"
}
]

Status: 404 Not Found
(none)


Update message
--------------

PUT /updateMessage/{id}

{
    "creatorId": "string",
    "contents": "string"
}

creatorId: Max length 50
contents: Max length 100

Response:
Status: 204 No content
(none)

Status: 403 Forbidden
(none)

Status: 404 Not Found
(none)

Status: 400 Bad Request
(none)
```

Note: For PUT and POST only mandatory properties are specified. Any additional properties in the payload will be ignored.

Also note: The API is designed to consume the existing MessageRecord class from the Skycave project, so there is no need to invent a new DTO.


