import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
<!--@@SCHEMA_IMPORT-->

const <!--@@PATH-->: ValidatedEventAPIGatewayProxyEvent<<!--@@TYPEOF_SCHEMA-->> = async (event) => {
  console.log(event.headers["User-Agent"]);
  console.log(event.queryStringParameters);
  console.log(event.multiValueQueryStringParameters);
  console.log(event.body);
  return formatJSONResponse(<!--@@RESPONSE_IMPLEMENT-->, {'Access-Control-Allow-Origin': '*'});
}

export const main = middyfy(<!--@@PATH-->);
