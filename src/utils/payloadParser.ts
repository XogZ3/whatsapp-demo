export function parseMessagePayload(payload: any) {
  let timestamp = Date.now();
  if (payload.errors) timestamp = payload.errors[0].timestamp * 1e3;
  if (payload.messages) timestamp = payload.messages[0].timestamp * 1e3;
  if (payload.statuses) timestamp = payload.statuses[0].timestamp * 1e3;

  let type = 'error';
  if (payload.statuses) type = 'status';
  if (payload.messages) type = 'message';

  let clientid = null;
  if (payload.statuses) clientid = payload.statuses[0].recipient_id;
  if (payload.messages) clientid = payload.messages[0].from;

  return {
    timestamp,
    type,
    clientid,
    messaging_product: payload.messaging_product,
    metadata: payload.metadata,
    // status messages
    status_raw: payload.statuses ? payload.statuses[0] : null,
    pricing: payload.statuses ? payload.statuses[0].pricing || null : null,
    status: payload.statuses ? payload.statuses[0].status || null : null,
    origin: payload.statuses ? payload.statuses[0].origin?.type || null : null,
    // incoming message
    message: payload.messages ? payload.messages[0] : null,
    contact: payload.contacts ? payload.contacts[0] : null,
    // error
    error: payload.errors ? payload.errors[0] : null,
  };
}
