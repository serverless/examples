import { ServiceBusClient } from '@azure/service-bus';
import { SampleModel } from '../model/sampleModel';
import log from '../config/loggerConfig';
const logger = log(__filename);
const connectionString = process.env.SERVICEBUS_CS;
const queueName = process.env.SERVICEBUS_QUEUE_NAME;
const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
const queueClient = sbClient.createQueueClient(queueName);
const sender = queueClient.createSender();

class ServiceBusMessageSender {
    public async send(message: SampleModel): Promise<void> {
        try {
            sender.send({ body: message });
            logger.debug(`Message has been sent successfuly. Message is ${message}`);
        } catch (err) {
            logger.error(`Exception occurred during sending notification. Exception is ${err}`);
        }
    }
}

export const serviceBusMessageSender = new ServiceBusMessageSender();
export default serviceBusMessageSender;
