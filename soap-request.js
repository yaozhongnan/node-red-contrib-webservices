module.exports = function (RED) {
  "use strict";
  const soap = require("soap");

  function SOAPRuquest(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const { method } = n;

    try {
      node.on("input", function (msg, nodeSend, nodeDone) {
        if (!msg.soapURL) {
          node.status({ fill: "red", shape: "dot", text: "No SOAP URL: " + err });
          node.error("No SOAP URL: " + err);
          return;
        }

        if (!(msg.soapURL.startsWith("http") && msg.soapURL.endsWith("?wsdl"))) {
          node.status({ fill: "red", shape: "dot", text: "URL Config Error: " + msg.soapURL });
          node.error("URL Config Error: " + msg.soapURL);
          return;
        }

        soap.createClient(msg.soapURL, function (err, client) {
          if (err) {
            node.status({ fill: "red", shape: "dot", text: "WSDL Config Error: " + err });
            node.error("WSDL Config Error: " + err);
            return;
          }

          if (!client.hasOwnProperty(method)) {
            node.status({ fill: "red", shape: "dot", text: "Method does not exist" });
            node.error("Method does not exist!");
            return;
          }

          client[method](msg.payload, {}, function (err, result) {
            if (err) {
              node.status({ fill: "red", shape: "dot", text: "Service Call Error: " + err });
              node.error("Service Call Error: " + err);
              return;
            }

            node.status({ fill: "green", shape: "dot", text: "SOAP result received" });
            msg.payload = result;
            nodeSend(msg);
            nodeDone();
          });
        });
      });

      node.on("close", function () {
        node.status({});
      });
    } catch (err) {
      node.status({ fill: "red", shape: "dot", text: err.message });
      node.error(err.message);
    }
  }

  RED.nodes.registerType("soap-request", SOAPRuquest);
};
