module.exports = function(RED) {
  const Jenkins = require('jenkins');

  function NodeJenkins(config) {
    RED.nodes.createNode(this, config);
    this.connection = RED.nodes.getNode(config.connection);
    var node = this;

    this.on('input',  async function(msg) {
      try {
        node.status({fill:'green', shape:'ring', text:'initializing....'});

        if (msg.hasOwnProperty('method')) {
          config.method = msg.method;
        }

        if (msg.hasOwnProperty('params')) {
          config.params = msg.params;
        } else {
          config.params = JSON.parse(config.params || '[]');
        }

        node.status({fill:'green', shape:'ring', text:'calling....'});

        const urlParts = node.connection.baseUrl.split('://');
        const jenkinsClient = new Jenkins({
          // form the url with the username and password
          baseUrl: urlParts[0] + '://' + node.connection.username + ':' + node.connection.password + '@' + urlParts[1],
        });

        // method is config.method and can be 'jobs.get'
        let method = jenkinsClient;
        let caller;
        config.method.split('.').forEach(m => {
          caller = method;
          method = method[m];
        });

        // params can be an array if multiple params are needed
        let params = config.params;
        if (!Array.isArray(params)) {
          params = [params];
        }
        // call method with params, bind to caller
        msg.payload = await method.apply(caller, params);
        node.status({fill:'green', shape:'dot', text:'Done'});
        node.send(msg);
      } catch (error) {
        node.status({fill:'red', shape:'dot', text:'Error'});
        node.error(error);
        node.error(error.stack);
      }
    });
  }
  RED.nodes.registerType('jenkins',  NodeJenkins);
}
