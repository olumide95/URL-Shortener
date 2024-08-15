import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  constructor(private readonly appService: AppService) {}

  async handleConnection(client: Socket) {
    const clientId = client.handshake.query.clientId as string;

    if (clientId) {
      this.clients.set(clientId, client);
      const messages = this.appService.getMessages(clientId);

      if (messages) {
        messages.map(async (message) => {
          await this.sendShortenedUrl(clientId, message);
        });
      }
    }
  }

  handleDisconnect(client: Socket) {
    const clientId = client.handshake.query.clientId as string;
    if (clientId) {
      this.clients.delete(clientId);
    }
  }

  async sendShortenedUrl(clientId: string, shortenedUrl: string) {
    try {
      const eventName = 'shortenedUrl';
      const data = { shortenedUrl };
      const sent = await this.sendMessageWithRetries(clientId, eventName, data);

      if (!sent) {
        this.appService.storeMessage(clientId, shortenedUrl);
      } else {
        this.appService.removeMessage(clientId, shortenedUrl);
      }
    } catch (error) {
      this.appService.storeMessage(clientId, shortenedUrl);
      console.error('Failed to send shortened URL:', error);
    }
  }

  async sendMessageWithRetries(
    clientId: string,
    eventName: string,
    data: any,
    retries: number = 3,
    timeout: number = 5000,
  ) {
    const client = this.clients.get(clientId);
    if (client) {
      return new Promise<boolean>((resolve, reject) => {
        let acknowledged = false;

        client.emit(eventName, data);

        const ackTimeout = setTimeout(() => {
          if (!acknowledged && retries > 0) {
            console.warn(
              `No acknowledgment received from ${clientId}. Retrying...`,
            );
            this.sendMessageWithRetries(
              clientId,
              eventName,
              data,
              retries - 1,
              timeout,
            )
              .then(resolve)
              .catch(reject);
          } else if (!acknowledged) {
            console.error(
              `Failed to get acknowledgment from ${clientId} after multiple retries.`,
            );
            reject(false);
          }
        }, timeout);

        client.once('ack', () => {
          acknowledged = true;
          console.error(`Clinet ${clientId} acknowledged.`);
          clearTimeout(ackTimeout);
          resolve(true);
        });
      });
    } else {
      console.error(`Client ${clientId} not connected.`);
      return false;
    }
  }
}
