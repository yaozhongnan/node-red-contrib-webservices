module.exports = function (RED) {
  const http = require("http");
  const fs = require("fs");
  const soap = require("soap");
  const path = require("path");
  const wsdlMake = require("wsdl-make");

  function SOAPServer(n) {
    RED.nodes.createNode(this, n);
    const node = this;
    const { port, ip, pathname, servername, portname, funcnames } = n;

    const InitServiceImplPort = {};

    const funcnamesList = funcnames.split(",");
    
    funcnamesList.forEach((item) => {
      InitServiceImplPort[item] = function (args, soapResponseCallback) {
        node.status({
          fill: "yellow",
          shape: "dot",
          text: `recv ${item} request`,
        });
        node.send({
          payload: {
            params: args,
            func: item
          },
          _soapServer_soapResponseCallback: soapResponseCallback,
        });
      };
    });

    try {
      const soapServer = {
        [servername]: {
          [portname]: InitServiceImplPort
        },
      };

      const xmlpath = path.resolve(__dirname, `./node_red_xml_weservices.wsdl`);

      wsdlMake({
        func: funcnamesList,
        servicesName: servername,
        portName: portname,
        url: pathname,
        port: port,
        ip: ip,
        path: xmlpath
      })


      const xmlString = fs.readFileSync(xmlpath, "utf8");

      const server = http.createServer(function (request, response) {
        response.end("404: Not Found: " + request.url);
      });

      server.listen(port);

      soap.listen(server, pathname, soapServer, xmlString, function () {
        node.status({
          fill: "green",
          shape: "dot",
          text: "SOAP server running",
        });
      });

      node.on("close", function (callback) {
        node.status({ fill: "yellow", shape: "dot", text: "stopping" });
        server.close(callback);
      });
    } catch (err) {
      node.status({ fill: "red", shape: "dot", text: err.message });
      node.error(err.message);
    }
  }

  RED.nodes.registerType("soap-server", SOAPServer);
};
