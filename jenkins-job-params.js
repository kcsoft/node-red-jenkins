module.exports = function(RED) {
    const Jenkins = require('jenkins');
    const { JSDOM } = require('jsdom');

    function NodeJenkinsJobParams(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        this.name = config.name;
        this.jobname = config.jobname;
        this.paramsarray = [];
        var node = this;
        const apiMethodJobParams = "job.config"
        // this.paramsarray = []

        this.on('input', async function(msg) {
            try {
                node.status({fill:'green', shape:'ring', text:'initializing....'});

                if (msg.hasOwnProperty('jobname')) {
                    config.jobname = msg.jobname;
                }
                this.jobname = config.jobname;

                const urlParts = node.connection.baseUrl.split('://');
                const jenkinsClient = new Jenkins({
                // form the url with the username and password
                baseUrl: urlParts[0] + '://' + node.connection.username + ':' + node.connection.password + '@' + urlParts[1],
                });
        
                node.status({fill:'green', shape:'ring', text:'calling....'});

                // method is config.method and can be 'jobs.get'
                let method = jenkinsClient;
                let caller;
                apiMethodJobParams.split('.').forEach(m => {
                    caller = method;
                    method = method[m];
                });
        
                // params can be an array if multiple params are needed
                let params = config.jobname;
                if (!Array.isArray(params)) {
                    // maybe String only  
                    params = [params];
                }          

                // call method with params, bind to caller
                xml = await method.apply(caller, params);
                //const xml = data.xml;

                const dom = new JSDOM(xml, { contentType: "text/xml" });
                const xmlDoc = dom.window.document;
                const results = [];
                var msg = new Object();
                reEx = /hudson\.model\..*ParameterDefinition/
                
                const allElements = xmlDoc.getElementsByTagName("*");
                const matchedElements = [];
              
                for (let element of allElements) {
                  const myObj = new Object();
                  if (reEx.test(element.tagName)) {
                    const fulltagname = element.tagName;
                    // extract standard DataType from Hudson Datatype String, empty if fails.
                    myObj.dataType = fulltagname.match(/hudson\.model\.(.*)ParameterDefinition/)[1] || [""];
                    //console.log(element['name']);
                    myObj.name = element.getElementsByTagName("name")[0].innerHTML;
                    myObj.defaultValue = element.getElementsByTagName("defaultValue")[0] ? element.getElementsByTagName("defaultValue")[0].innerHTML : ""
                    matchedElements.push(myObj);   
                  }
                }
                const elements = matchedElements;               
                msg.payload = elements;

                this.paramsarray = elements;
                node.status({fill:'green', shape:'dot', text:'Done'});
                //this.paramsarray = elements;
                // node.send(msg);
            } catch (error) {
                node.status({fill:'red', shape:'dot', text:'Error'});
                node.error(error);
                node.error(error.stack);
            }
        });
    }
    RED.nodes.registerType("jenkins-job-params", NodeJenkinsJobParams);
}
