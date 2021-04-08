import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
<!--@@SCHEMA_IMPORT-->

const <!--@@PATH-->: ValidatedEventAPIGatewayProxyEvent<<!--@@TYPEOF_SCHEMA-->> = async (event) => {
  return formatJSONResponse({
    message: `I just want to say, F**ck you!🖕`,
    event,
  }, {'Access-Control-Allow-Origin': '*'});
}

export const main = middyfy(<!--@@PATH-->);
