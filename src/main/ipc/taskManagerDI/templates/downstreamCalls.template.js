const {
  getAuthToken
} = require("@kovai-pazhamudir-nilayam/kpn-platform-token");

/*
  SAMPLE_GET_CALL and SAMPLE_POST_CALL are placeholders for actual API calls.
  Replace them with meaningful names and logic as per your requirements.
*/

function TEMPLATE_Repo(fastify) {
  async function SAMPLE_GET_CALL({ logTrace, input }) {
    const auth = await getAuthToken("PLATFORM");
    const response = await fastify.request({
      url: `${fastify.config.CORE_SAMPLE_URI}/v1/sample/get-call`,
      method: "GET",
      headers: {
        ...logTrace,
        Authorization: auth,
        "x-channel-id": "WEB"
      },
      path: "/core-domain-name/v1/sample/api/call", // Needs to be corrected
      downstream_system: "core-domain-name-service", // Needs to be corrected
      source_system: "core-task-manager-di",
      domain: "core",
      functionality: "sample functionality description" // Needs to be corrected
    });

    return response;
  }

  async function SAMPLE_POST_CALL({ logTrace, body }) {
    const auth = await getAuthToken("PLATFORM");
    const response = await fastify.request({
      url: `${fastify.config.CORE_SAMPLE_URI}/v1/sample/post-call`,
      method: "POST",
      headers: {
        ...logTrace,
        Authorization: auth,
        "x-channel-id": "WEB"
      },
      body,
      path: "/core-domain-name/v1/sample/api/call", // Needs to be corrected
      downstream_system: "core-domain-name-service", // Needs to be corrected
      source_system: "core-task-manager-di",
      domain: "core",
      functionality: "sample functionality description" // Needs to be corrected
    });
    return response;
  }

  return {
    SAMPLE_GET_CALL,
    SAMPLE_POST_CALL
  };
}

module.exports = TEMPLATE_repo;
