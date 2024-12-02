module.exports = function(RED) {
  function JenkinsConnection(n) {
    RED.nodes.createNode(this,n);
    this.username = n.username;
    this.password = n.password;
    this.baseUrl = n.baseUrl;
  }
  RED.nodes.registerType('jenkins-connection', JenkinsConnection);
}