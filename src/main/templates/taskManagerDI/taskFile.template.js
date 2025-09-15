const schema = {
  type: "object",
  required: ["phone_number", "wallet_amount", "order_number"],
  additionalProperties: false,
  properties: {
    phone_number: { type: "string", minLength: 10, maxLength: 10 },
    customer_name: { type: "string" },
    wallet_amount: { type: "number" },
    order_number: { type: "string" }
  }
};

function TEMPLATE_TASK_NAME(fastify) {
  return async ({ body, logTrace }) => {
    fastify.validateSchema({
      schema,
      data: body,
      key: "TEMPLATE_TASK_NAME"
    });

    // actual definition of the task logic
  };
}
module.exports = TEMPLATE_TASK_NAME;
