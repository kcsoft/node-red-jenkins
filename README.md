# Node-RED Jenkins


This node is using [jenkins package](https://www.npmjs.com/package/jenkins) to interact with Jenkins.


## Configuration

You need to configure the Jenkins node with the URL of your Jenkins server and the credentials to use. For password you can use the user's password or an API token.


## Using the Jenkins node

You can pass in `msg.method` and optional `msg.params` or specify a method/params in the configuration of the node.

`msg.method` is the Jenkins API method to call. For example, `build.get`.

`msg.params` is an object containing the parameters to pass to the method. For example, `{"name": "myjob"}`. If the method requires multiple parameters, you can pass them in an array. For example, `["myjob", 1]`.

After execution, the `msg.payload` will contain the result.
