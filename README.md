# Hubs Cloud

This repo contains the docs for the (currently alpha, **do not rely upon in production**) Hubs Cloud tooling, which aims to simplify setting up [Hubs](https://hubs.mozilla.com) and [Spoke](https://hubs.mozilla.com/spoke) on cloud providers. The currently supported cloud provider is AWS.

## Quick Start

- Create an account on AWS and log into the console.
- Register a new domain name on Route 53 for your site, and register another domain name on Route 53 for room short permalinks. We like using the .link TLD for the permalink domain. So if your site is myhubs.com your permalink domain would be myhubs.link, or something similar.
- In the EC2 console, create an new SSH keypair and save the private key. You'll need this to access your servers.
- Set your console in the top right to one of the supported regions:
  - US East (N. Virginia)
  - US East (Ohio)
  - US West (Oregon)
  - Asia Pacific (Tokyo)
  - EU (Ireland)
- Go to https://gethubscloud.com which will take you to CloudFormation. Fill out the form to create a new CloudFormation stack.
- The stack takes about 20-30 minutes to initialize.
- After the stack is created:
  - Click on the link in the AWS verification email you received.
  - Hit your site. After a minute or so, it should be up.
  - Proceed with the login + setup process.

## Using an existing domain

If you have an existing domain you'd like to use for the site, that's fine. You'll still need to register a domain on Route 53 for internal routing. (See the CloudFormation stack creation form in the 'Domain Configuration' section.) Once the stack is created, if you are using your own domain name, go to the stack outputs and follow the instructions under the "AddressForRootDomain" description. 

## Using an existing email SMTP server

By default Hubs Cloud uses Amazon SES for email. You can also use your own SMTP server for sending email. Choose your internal domain for the EmailZone and create the stack, and then once the stack is set up you can set SMTP information in the Hubs Cloud admin console in the Server Settings page.

## Known Issues

#### I get the error "Value for parameter availabilityZone is invalid. Subnets can currently only be created in the following availability zones: X, Y

This is a known issue with AWS. See: https://github.com/widdix/aws-cf-templates/issues/36. To fix it, you will need to adjust the "Subnet Availability Zones" values in the 'Advanced' section to select an alternative Subnet configuration that matches X, Y and try again.

## Deploying Forks

Once you have a working stack on AWS, you can easily deploy forks of [Hubs](https://hubs.mozilla.com) by cloning the [repo](https://github.com/mozilla/hubs) and running `npm run deploy`. If you want to revert back to the upstream version, run `npm run undeploy`.

Note: When running a deploy, ensure webpack-dev-server (`npm start`) is **not** running. This may cause conflics in the build process.

## Updating the stack

To keep your software up-to-date, you need to update the stack template and apply it. You will not experience any downtime when updating the stack. To do so:

- Select the stack in the CloudFormation console
- Go to Stack Actions -> Update Stack
- Choose "Update the existing template"
- For the URL, enter:
```
https://hubs-cloud.s3-us-west-1.amazonaws.com/stack.yaml
```
- Review the parameter selections and choose 'Update'

Additionally, you can go through the same process but choose 'Use the existing template' in order to adjust settings of the stack like the number of instances.

## AWS Costs

The stack is designed to minimize AWS costs, and all services except for the database have AWS free tier offerings. If you are just using this with a few people, your primary charges will be the EC2 instances you use, EFS storage, and, if you do not switch to Cloudflare (see below), data transfer costs.

As you use the service, you will see AWS costs:

- EC2 instances: the stack configuration lets you choose how many instances to use, a single t2.micro is needed by default. At time of this writing that costs approx $9/mo.
- An [Aurora serverless](https://aws.amazon.com/rds/aurora/pricing/) database: you will be charged for database usage. At the time of this writing approx $0.06 per ACU Hour. (Note this is *ACU* hours, not 'instance hours', so you will likely be spending very little since Hubs and Spoke do not rely upon heavy database resource usage.)
- [EFS](https://aws.amazon.com/efs/pricing/) storage: you will be charged for storage of uploaded scenes and avatars. At the time of this writing approx $0.30/gb month.
- [Cloudfront](https://aws.amazon.com/cloudfront/pricing/) data transfer costs.
- There are a variety of lambdas used for doing image resizing, video transcoding, etc subject to [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing) but unlikely to exceed free tier levels.

Note that you can significantly save data transfer charges by switching your CDN to Cloudflare. In the Hubs Cloud admin console, go to the "Data Transfer" page to see how.

Currently, all of these services except for Aurora Serverless fall under the [AWS free tier](https://aws.amazon.com/free/).
