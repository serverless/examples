// Invoked by EventBridge with one matching event per invocation. The event's
// payload is in `detail`.
export const orderPlaced = async (event) => {
  const { orderId, total } = event.detail;
  console.log(`Order ${orderId} placed: total ${total}, event ${event.id}`);
};
