# REST API Connection to MONGODB Cloud Atlas

This project contains source code and supporting files for a **seriously modified** serverless application that you can deploy with the SAM CLI.

I rebuilt this application with the following goals:

 - Learn Lambda Layers
 - Learn how to craft HTTP Methods into REST calls
 - Learn how to store secrets (like passwords and connect strings)
 - Testing Local and Remote
 - Learn how to package and deploy functions and layers from the CLI (not GUI)
 - Learn how the CLI tools work (their idiosyncrasies)
 - Learn the structure and meaning of template.yaml

## Learnings

### Secret Store

Use `aws ssm put-parameter` to add parameters to the (secret) store. Parameters can only be retrieved through code,
meaning the code must have access to the AWS client SDK. The code retrieving the secrets (Lambda function) must be
given permission to retrieve the secret and decrypt it. The Function > Properties > Policies or its equivalent needs
to have the correct roles. See template.yaml for detatils. Parameters can be retrieved in groups via a path. Because
a single IAM identity may have control over numerous applications, to keep the parameters organized, they should be
named with a path structure (eg. "/bake/mdb/connection", getParms("/bake/mdb") or "/bake").

### REST and MongoDB Access

The challenge with this portion of the project was understanding how to craft the HTTP verbs into something meaningful
representing REST calls. I wound up with the standard SIX verbs in the template.yaml file. I think there's a way to
make it shorter with {proxy+} or some such decoration. However, not all combinations of HTTP verbs and paths are legit,
which means I could specify a single match for the entire group, but to be secure and skip calls to the lambda code,
other secure guards should be put in place. I didn't pursue this avenue because the work required to just get explicit
calls to the lambda function was enough. It's important to note that it's best to allow the AWS infrastructure to stop
incorrect calls before they get to the lambda function for a number of reasons: (1) you aren't charged for calls that
don't make it to your code, (2) the web call ends faster because the infrastructure doesn't have to spin up your code
just to find out it's not a legal combination. I think these are the most important reasons.

### Local and Remote Testing

There are actually three types of testing to be done:

1. Test local functions directly (no web calls)
2. Test web locally in *AWS Mocked Server*.
3. Test hosted in the cloud.

\#1 is straightforward with Jest or other test runner tools. \#2 is probably easy to skip if you just feel like
uploading the code and testing in the hosted model. However, that's not an efficient development loop. Better to
test locally in as close to an AWS-like environment, then, when working, push the code to the cloud and test there.
Understanding how to deal with local code was a big challenge. At the moment, my first rule would be to stay away
from `sam build`. I can see no value in it, but I'd like to understand one day what the AWS engineers think it's
good for. Instead, set up Layers (see below) and run `sam local start-api`. This launches an AWS
mocked server that will do what you need it to. So, local calls to that server will work well. Finally, `sam deploy`
and the flag `--guided` help push changes up to the cloud. Be sure to use the check configuration mode (setup when
you start with `sam init`) so you can review changes before the pushed up.

### Lambda Layers

Layers allow you to have what amount to common libraries already provisioned in the cloud. Lambda functions work by pulling in an entire virtual image of an operating system and supporting programs (like Node). Then, all of the code required to run the function. In this case, because we're using mongoDB, we need javascript database drivers. Also, as we store the MDB connection string (containing a password) in AWS secure storage, AWS client libraries are pulled in, too. That amounts to 4MB of code just to get the libraries up and running. Then, I have a tiny file (150 lines) that processes web requests and interacts with the database once it fetches the connection data (including the decrypted password). That 4MB of code is hefty. It could be used by other function groups eventually (unimportant to me at the moment, but still good to know). It slows down my development process because if I make a change, the entire 4MB gets uploaded, not my little 5K app code. Also, every time I want to test locally, that 4MB also gets processed and loaded, so it slows down local testing in a mock AWS environment. Plenty of good reasons to isolate the low to no changing library/driver code and keep it away from speedy development process.

The lambda isolation is in the template.yaml file. Also, because we only need to refer to the layer one time (!Ref) until it's uploaded, we can hardcode the ARN into the template.yaml once the layer has been uploaded. With the !Ref in the template.yaml, the local AWS server mock (`sam local server-api`) is very costly, it rebuilds the image on every request. However, if the ARN is in the template.yaml, then the local version always refers to that specific Layer version. So will the hosted lambda, for that matter. I think this is a good thing and provides a more stable configuration.

Also, `sam deploy` can notice that an entire source code group has not changed and won't deploy if there are no changes. However, it's important to make sure the node_modules package is stable. Therefore, when building for production or deploy or what have you, make sure you have a repeatable node_modules directory. Specifically, `npm ci --only=prod` should be the way to go. Also, notice there are three package.json files. I'm not sure this was a good idea, but I did what I did, for now. The top level package.json contains the test references, etc., and reflects the true nature of the code in terms of runtime and development time dependencies. The layer code (libs) has a package with only the runtime dependencies as I didn't trust the npm install process, but this may have been overkill. The src directory has one with everything in developed dependencies so that we don't create a node_modules at build and deployment time. Otherwise, we'd have duplicated the node_modules and destroyed the behavior we want (isolate the large unchanging library code to its own layer).


------------

*Boilerplate from the code upon which this was built*

----------

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
* **AWS Region**: The AWS region you want to deploy your app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
sam-app$ sam build
```

The SAM CLI installs dependencies defined in `hello-world/package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
sam-app$ sam local invoke HelloWorldFunction --event events/event.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
sam-app$ sam local start-api
sam-app$ curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
sam-app$ sam logs -n HelloWorldFunction --stack-name sam-app --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `hello-world/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests.

```bash
sam-app$ cd hello-world
hello-world$ npm install
hello-world$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name sam-app
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
