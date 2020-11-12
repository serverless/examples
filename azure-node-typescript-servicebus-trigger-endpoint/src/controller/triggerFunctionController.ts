import { Context } from '@azure/functions';
import { SampleModel } from '../model/sampleModel';
import log from '../config/loggerConfig';
const logger = log(__filename);

export const sampleHandler = async (context: Context, message: SampleModel): Promise<void> => {
    logger.info(
        `Azure function has been trigged with message ${JSON.stringify(message)} in service bus`
    );
    context.res = {
        statusCode: 200
    };
};
