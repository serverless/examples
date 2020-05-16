export class ResponseBodyVO {
  code: number;
  message: string;
  data?: object;
}

export class ResponseVO {
  statusCode: number;
  body: string;
}
