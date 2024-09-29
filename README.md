# FCM Notification Service

> > DISCLAIMER

> This service is able to:
>
> 1. Consume messages from a specific RabbitMQ queue (e.g. queueName=notification.fcm)
> 2. Send notification to specific topic NOT deviceID (\*note below) (received http status 200 from Firebase)
> 3. Save to database on the message identifier
> 4. Publish message to a specific RabbitMQ topic (e.g. topicName=notification.done)

> \*_since sending Firebase Notification requires ACTUAL front-end (web, android, iphone) to subscribe their device ID to this service, creating front-end will be out-of-scope of the task. Please let me know if this current state is sufficient or you need the front-end as well._

## Requirements

- Node.js 18
- Docker

## Setup

1. Clone repository:

```
git clone https://github.com/Silentvoician1346/imbee-test.git

```

open folder `imbee-test`

2. Install dependencies:

```
npm install
```

3. Set up `.env` and `firebase-sdk.json` that you receive from email on root project directory.

4. Run Docker Compose:

```
docker-compose build --no-cache

```

```
docker-compose up
```

Please wait until docker console says:

> Waiting for messages in queue: {topic}

_The service might gives ECONNREFUSED error for the first time since rabbitmq is not ready yet. Therefore retry mechanism has been implemented. The service should be ready in 10-30 seconds._

5. Set up MySQL schema

open new terminal, type:

```
docker exec -it imbee-test-mysql-1 mysql -u root -p
```

enter password: `password`

inside mysql prompt, type:

```
USE fcm_service
```

when database chosen, type:

```
CREATE TABLE fcm_job (id INT AUTO_INCREMENT PRIMARY KEY, identifier VARCHAR(255) NOT NULL, deliverAt DATETIME NOT NULL );
```

The service should now be available on port 3000 and ready to test.

## Testing the application

To send queue to `notification.fcm`, open new terminal and type:

```
docker exec -it imbee-test-app-1 node /app/controllers/sendMessage.js
```

Expected result:

1. Firebase Notification to specific topic is sent.
2. New entry {id, identifier, deliverAt} on table `fcm_job` is stored.
3. Message to `notification.done` is published and shown in docker console as:
   > `Published result to {topicName}:, {payload}`

To check if new entry is stored in the database, enter:

```
docker exec -it imbee-test-app-1 node /app/controllers/getDb.js
```

The new entry should have been added to the list.

###### **\*\*\*\***\*\***\*\*\*\***\_\_\_**\*\*\*\***\*\***\*\*\*\***

###### Thank you for your time reading this! Andrian.
