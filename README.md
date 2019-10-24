# Hubs Cloud

This repo contains the docs for the (currently alpha) Hubs Cloud tooling, which aims to simplify setting up Hubs and Spoke on cloud providers. The currently supported cloud provider is AWS.

## Quick Start

- Create an account on AWS and log into the console.
- Register a new domain name on Route 53.
- In the EC2 console, create an new SSH keypair and save it.
- Go to https://gethubscloud.com which will take you to Cloudformation. Fill out the form to create a new Cloudformation stack.
- The stack takes about 15-20 minutes to initialize.
- (Optional) If you are using your own domain name, go to the stack outputs and follow the instructions under the "AppALBDomain" output. 
- Hit your site, it should be up. Proceed with the login + setup process.

Note that if you have an existing domain you'd like to use, that's fine. You'll still need to register a domain on Route 53 for internal routing. (See the Cloudformation stack creation form.)

## Deploying Forks

Once you have a working stack on AWS, you can easily deploy forks of Hubs by cloning the repo and running `npm run deploy`. If you want to revert back to the upstream version, run `npm run undeploy`.
