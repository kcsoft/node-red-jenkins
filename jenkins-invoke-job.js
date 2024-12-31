module.exports = function(RED) {
    const Jenkins = require('jenkins');
    //const Job = require('jenkins-job-params');
    const { JSDOM } = require('jsdom');

    function NodeJenkinsInvokeJob(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        this.job = RED.nodes.getNode(config.job);
        var node = this;
        const apiMethodBuild = "job.build"

        this.on('input', async function(msg) {
            try {
                node.status({fill:'green', shape:'ring', text:'initializing....'});

                // if (this.job.paramsarray) {
                //      this.paramsarray = this.job.paramsarray;
                // }

                const urlParts = node.connection.baseUrl.split('://');
                const jenkinsClient = new Jenkins({
                // form the url with the username and password
                baseUrl: urlParts[0] + '://' + node.connection.username + ':' + node.connection.password + '@' + urlParts[1],
                });
        
                node.status({fill:'green', shape:'ring', text:'calling....'});

                // method is config.method and can be 'jobs.get'
                let method = jenkinsClient;
                let caller;
                apiMethodBuild.split('.').forEach(m => {
                    caller = method;
                    method = method[m];
                });
        
                // params can be an array if multiple params are needed
                // let params = this.paramsarray;
                const pipeline = node.job.jobname;
                let params = {"name":pipeline}
                const paramsarray = node.job.paramsarray;
                node.warn("Pipeline/Job - Name: "+pipeline);
                node.warn("paramsarray: "+paramsarray);
                if (!paramsarray) {
                    params = {"name":pipeline}
                } else {
                    const n3 = new Object();
                    for (let oneparam of paramsarray) {
                        //if (oneparam.dataType=="String") {
                        node.warn("Nth param name:"+oneparam.name);
                        node.warn("Nth param dataType:"+oneparam.dataType);
                        //}
                    }
                    params = {"name":pipeline,"parameters":{"YOUR_NAME":"Hard Coded Name"}}
                }
                if (!Array.isArray(params)) {
                    params = [params];
                }
                node.warn("params: "+params.name+", "+params.parameters);

                var msg = new Object();

                // call method with params, bind to caller
                invoke_result = await method.apply(caller, params);
                
                msg.payload = invoke_result;

                node.status({fill:'green', shape:'dot', text:'Done'});
                node.send(msg);
            } catch (error) {
                node.status({fill:'red', shape:'dot', text:'Error'});
                node.error(error);
                node.error(error.stack);
            }
        });
    }
    RED.nodes.registerType("jenkins-invoke-job", NodeJenkinsInvokeJob);
}