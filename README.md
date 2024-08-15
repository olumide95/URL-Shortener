<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

This is a URL Shortener service built using [NestJS](https://nestjs.com/) (version 10). The service allows users to shorten URLs, retrieve the original URLs using shortened codes, and communicates with clients via WebSockets for URL shortening results.

## API Documentation
```bash
The API documentation can be found at http://localhost:3000/documentation

```

## Features

- **POST /url**: Shorten a valid URL and receive the shortened URL via WebSocket.
- **GET /:code**: Retrieve the original URL using the shortened code.
- **WebSocket Communication**: The server sends the shortened URL to the client via WebSocket, ensuring delivery even in unstable network conditions with retry logic.
- **GET /documentation**: Documentation UI
- **GET /index.html**: Client UI

## Technologies

- **NestJS 10**
- **WebSocket**: Implemented using `@nestjs/websockets` and `socket.io`
- **Nodemailer**: Email notifications.
- **Swagger**: API documentation
  
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## WebSocket Communication
Client Setup
To communicate with the server using WebSocket, the client should connect to the WebSocket server at http://localhost:3000 with a clientId query parameter.

Example:
```
const socket = io('http://localhost:3000', {
  query: {
    clientId: '12345'
  }
});

socket.on('shortenedUrl', (data) => {
  console.log('Received shortened URL:', data.shortenedUrl);
  // Acknowledge the receipt
  socket.emit('ack');
});
```

## Retry Logic
If the client is not connected or does not acknowledge receipt of the shortened URL, the server will retry sending the message up to 3 times, with a 5-second interval between retries. The server will also cache the shortened URL and resend the messages on client re-connection.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


