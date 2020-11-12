import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { SampleModel } from '../model/sampleModel';
import log from '../config/loggerConfig';
import servcieBusMessageSender from '../service/serviceBusMessageSender';
const logger = log(__filename);

export const sendMessage: AzureFunction = async (
    context: Context,
    event: HttpRequest
): Promise<void> => {
    try {
        logger.info(`Request arrived in controller with body ${event.rawBody}`);
        const message: SampleModel = JSON.parse(event.rawBody);
        servcieBusMessageSender.send(message);
        context.res = {
            statusCode: 201
        };
    } catch (err) {
        logger.error(`Error occured while sending message to service bus`)
        context.res = {
            statusCode: err.statusCode
        };
    }
};
