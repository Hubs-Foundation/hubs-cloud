# Hubs Cloud

This repo contains the docs for the (currently alpha) Hubs Cloud tooling, which aims to simplify setting up Hubs and Spoke on cloud providers. The currently supported cloud provider is AWS.

## Quick Start

- Create an account on AWS and log into the console.
- Register a new domain name on Route 53 for your site, and register another domain name on Route 53 for room short permalinks. 
- In the EC2 console, create an new SSH keypair and save the private key. You'll need this to access your servers.
- Go to https://gethubscloud.com which will take you to Cloudformation. Fill out the form to create a new Cloudformation stack.
- The stack takes about 15-20 minutes to initialize.
- Hit your site a minute or so after the stack is created, it should be up. Proceed with the login + setup process.

## Using an existing domain

If you have an existing domain you'd like to use for the site, that's fine. You'll still need to register a domain on Route 53 for internal routing. (See the Cloudformation stack creation form in the 'Domain Configuration' section.) Once the stack is created, if you are using your own domain name, go to the stack outputs and follow the instructions under the "AppALBDomain" output. 

## Using an existing email SMTP server

By default Hubs Cloud uses Amazon SES for email. You can also use your own SMTP server for sending email. Just create the stack and choose your internal domain for the EmailZone, and then once the stack is set up you can set SMTP information in the Hubs Cloud admin console in the Server Settings page.

## Deploying Forks

Once you have a working stack on AWS, you can easily deploy forks of Hubs by cloning the repo and running `npm run deploy`. If you want to revert back to the upstream version, run `npm run undeploy`.

## AWS Costs

The stack is designed to minimize AWS costs, and all services except for the database have AWS free tier offerings. If you are just using this with a few people, your primary charges will be the EC2 instances you use, EFS storage, and, if you do not switch to Cloudflare (see below), data transfer costs.

As you use the service, you will see AWS costs:

- EC2 instances: the stack configuration lets you choose how many instances to use, a single t2.micro is needed by default. At time of this writing that costs approx $9/mo.
- An [Aurora serverless](https://aws.amazon.com/rds/aurora/pricing/) database: you will be charged for database usage. At the time of this writing approx $0.06 per ACU Hour. (Note this is *ACU* hours, not 'instance hours', so you will be spending very little if your database is not consuming any resources.)
- [EFS](https://aws.amazon.com/efs/pricing/) storage: you will be charged for storage of uploaded scenes and avatars. At the time of this writing approx $0.30/gb month.
- [Cloudfront](https://aws.amazon.com/cloudfront/pricing/) data transfer costs.
- There are a variety of lambdas used for doing image resizing, video transcoding, etc subject to [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing) but unlikely to exceed free tier levels.

Note that you can significantly save data transfer charges by switching your CDN to Cloudflare. In the Hubs Cloud admin console, go to the "Data Transfer" page to see how.

Currently, all of these services except for Aurora Serverless fall under the [AWS free tier](https://aws.amazon.com/free/).
