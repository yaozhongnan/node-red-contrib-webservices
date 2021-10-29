module.exports = function (RED) {
  function SOAPResponse(n) {
    RED.nodes.createNode(this, n);
    const node = this;

    node.on("input", function (msg) {
      const callback = msg["_soapServer_soapResponseCallback"];
      if (callback == null) {
        node.warn("No previous soap server found for a soap server response.");
        return;
      }
      callback(msg.payload);
    });
  }

  RED.nodes.registerType("soap-response", SOAPResponse);
};
