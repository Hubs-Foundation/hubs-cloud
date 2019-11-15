# Running your own hub with Hubs Cloud

This repo contains the docs for the (currently alpha, **do not rely upon in production**) Hubs Cloud tooling, which allows you to run your own hub on AWS (and soon other cloud providers.)

## Quick Start

- Create an account on AWS and log into the console.
- Register a new domain name on Route 53 for your hub, and register another domain name on Route 53 for room short permalinks. We like using the `.link` TLD for the permalink domain. So if your hub is `myhub.com` your permalink domain would be `myhub.link`, or something similar.
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
  - Hit your site. After 20 or 30 seconds, it should be up.
  - Proceed with the login + setup process.

## Using an existing domain

If you have an existing domain or subdomain from a DNS provider like GoDaddy or Namecheap you'd like to use for your hub, that's fine. You'll still need to register two new domains on AWS Route 53 - one for internal routing and one for your short room permalinks. You'll also need a domain for email if you don't have an email provider. (Hubs Cloud will set up AWS Simple Email Service for you on your email domain.)

You'll also need to create two SSL certificates for your existing domain using the AWS Certificate Manager, one in the same region for your stack, and another in US-East-1 (if that's not the region your stack is in.) See the CloudFormation stack creation form in the 'Domain Configuration' section for more details.

Once the stack is created, if you are using an external DNS provider like GoDaddy or Namecheap, look in the stack "Outputs" for the "AddressForRootDomain" field -- you will need to create a new CNAME in your domain's DNS to point there to get your domain pointing to your hub. 

## Using an existing email SMTP server

By default your hub will be set up with Amazon SES for email. You can also use your own SMTP server for sending email. Choose your internal domain for the EmailZone and create the stack, and then once the stack is set up you can set SMTP information in your hub's admin console in the Server Settings page.

## Updating the stack

You can change various settings of your hub's stack by performing a stack Update. You will not experience any downtime when making these changes. To Update your stack:

- Select the stack in the CloudFormation console
- Go to Stack Actions -> Update Stack
- Choose "Use the existing template"
- Review the parameter selections and choose 'Update'

Some of the things you can do to your stack via a stack update:

- Change the number and type of servers
- Temporarily take your stack Offline to save costs (and redirect to a URL)
- Add or change a monthly database budget or adjust storage limits
- Add or remove an Application Load Balancer
- Disable or enable database auto-pausing
- Change the database max ACU capacity 
- Change the SSH keypair used by your servers

Some things you should *not* update or change after the stack is created:

- Your domains or mail settings
- Everything under "Restore from Backup" section (to restore from a backup, see documentation below)
- Everything under "Advanced"

## Creating and Deploying custom clients

Once you have a working hub on AWS, you can easily create and deploy custom versions of the [Hubs Client](https://hubs.mozilla.com) by cloning the [repo](https://github.com/mozilla/hubs).

Normally, when you run `npm start` after a fresh checkout, you will be using Mozilla's dev hub. Once you have your own hub set up, you can point your local client to it so that rooms, scenes, etc from your hub will be available when running your local client.

To run your locally modified client against your self hosted hub run the `scripts/use-hubs-cloud-stack.sh` script. (Run this script without arguments to see how to use it.) After running this script, `.env.defaults` will be modified so subsequent runs of `npm start` will be accessing your hub. You can commit the changes to `.env.defaults` to make this change permanent. If you'd like to go back to using Mozilla's dev hub, you can run `scripts/use-mozilla-dev.sh`.

To deploy your custom client, run `npm run deploy` and follow the prompts. If you want to revert your hub back to using the Mozilla upstream version of the client, run `npm run undeploy`.

Note: When running a deploy, ensure webpack-dev-server (`npm start`) is **not** running. This may cause conflics in the build process.

## Known Issues

#### I get the error "Value for parameter availabilityZone is invalid. Subnets can currently only be created in the following availability zones: X, Y

This is a known issue with AWS. See: https://github.com/widdix/aws-cf-templates/issues/36. To fix it, you will need to adjust the "Subnet Availability Zones" values in the 'Advanced' section to select an alternative Subnet configuration that matches X, Y and try again.

## Backup & Restore

If something goes wrong and you need to restore from a backup, or you'd like to just make a second hub using the same data from an existing hub, the stack creation form makes it fairly simple to do so.

Your hub's data is made up of two things: an AWS Aurora Serverless database, and an AWS Elastic File Store volume (used for scenes, avatars, etc.) Both of these are backed up for you automatically on a nightly basis. The database is backed up via database snapshots (which can be seen in the RDS console) and the EFS volume is backed up into a Vault in AWS Backup (which can be found in the AWS Backup console.)

### Creating a manual backup

In addition to automatic backups, if you want to make an up-to-the-minute backup of a hub you can manually create a RDS snapshot and new AWS Backup recovery point via the console. It's highly suggested you put your stack into "Offline" mode by performing a stack update before doing so to limit the risk of data being missed.

To create a database snapshot, select your database cluster in RDS and under "Actions" click "Take Snapshot". If you're unsure which cluster is your hub's database, it can be found in the stack "Outputs" section under `AppDb`.

To create a new recovery point, you'll need to use the "Create On-Demand Backup" tool in the AWS Backup console. First, get the filesystem id from `StorageEFS`, the vault name from `DailyBackupVault`, and the IAM role under `DailyBackupRole` from the "Outputs" section of your stack. Then in the AWS Backup console, go to "Protected Resources" and select the filesystem id you saw for `StorageEFS`. Then click "Create On-Demand backup." Under the "Vault" section select the vault from `DailyBackupVault`, and under the IAM section select "Choose an IAM Role" and select the IAM role from `DailyBackupRole`.

If you are planning on restoring from this backup, before proceeding make sure both the database snapshot and storage backup job have completed. You can check the status of the snapshot via the "Snapshots" section in RDS, and the status of the backup in the "Jobs" section of AWS Backup.

### Restoring from a backup

To restore from a backup, you will create a new stack, and you need to provide the necessary information in the stack creation form in the "Restore from Backup" section. Do *not* perform a stack update to an existing stack to try to restore from a backup -- this will not work and will likely break things. You *must* create a new stack to restore from a backup.

If you want to revert an existing stack to data in a backup, you will first need to delete the stack and then create a new one restored from the backup. Deleting the stack is safe once you have confirmed you have a completed database snapshot and a restore point.

This info you need to provide can be found in the RDS and AWS Backup consoles:

- The RDS snapshot ID to restore from
- The AWS Backup vault name to restore from
- The recovery point ARN to restore from, from the vault

Additionally, there are some secrets like encryption keys that are needed to restore from a backup. The secrets you need are *not* automatically deleted when you delete a stack, so even if you deleted the stack whose backups you are restoring, the necessary secrets should still be in your AWS account unless you manually removed them.

The first secret is the database secret for the stack whose backups you are restoring. To find this, go to AWS Secrets Manager and look for the secret "*Stack Name* Database Secret." You'll need to provide the ARN to this secret in the stack create form for the new stack.
  
Additionally, there are some secrets stored in AWS Parameter Store. You will *not* need to dig these up. As long as you haven't gone in and deleted them manually, these secrets can be looked up automatically by providing the stack name and the stack region for the stack you are restoring from in the creation from.

Once you've filled these values out and create the stack it should be restored from the backup. It should behave identically to the original stack, except you will need to configure the "Server Settings" in the Admin console, which are not backed up. *Note*: if you perform a stack update on a stack that was restored from backup, it is critical you do *not* change the parameters under the "Restore from Backup" section -- leave them filled in and don't touch them!

## AWS Costs

Your hub is designed to minimize AWS costs, and all services except for the serverless database have AWS free tier offerings. If you are just using this with a few people, your primary charges will be the EC2 instances you use, the serverless hourly database costs, EFS storage, and, if you do not switch to Cloudflare (see below), data transfer costs.

As you use the service, you will see AWS costs:

- EC2 instances: the stack configuration lets you choose how many instances to use, a single t2.micro is needed by default. At time of this writing that costs approx $9/mo.
- An [Aurora serverless](https://aws.amazon.com/rds/aurora/pricing/) database: you will be charged for database usage. At the time of this writing $0.12 per hour used, rounded to the nearest 10 minutes. If you've enabled database auto-pausing in your stack configuration (the default) then you will only pay for the database when visitors are accessing your site. If you are concerned about excessive database costs, you can set a budget in the stack settings that will cause your stack to be put into Offline mode automatically if your budget is exceeded. (which will shut down all the servers, including the database) 
- [EFS](https://aws.amazon.com/efs/pricing/) storage: you will be charged for storage of uploaded scenes and avatars. At the time of this writing approx $0.30/gb month and $0.10/gb month for data that hasn't been accessed in 30 days.
- [Cloudfront](https://aws.amazon.com/cloudfront/pricing/) data transfer costs.
- There are a variety of lambdas used for doing image resizing, video transcoding, etc subject to [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing) but unlikely to exceed free tier levels.
- You will also be paying $1/mo for each of your Route 53 domains and also $0.40/mo for the database secret.

Note that you can significantly save data transfer charges by switching your CDN to Cloudflare. In your hub's admin console, go to the "Data Transfer" page to see how.

If you'd like to maximize your cost savings, you can perform a stack update to switch the stack into "Offline" mode when you are not using it, though this likely unnecessary except for cases where you are running at a higher capacity settings than the defaults.

Currently, all of these services (except for Aurora Serverless, Route 53, and Secrets Manager) fall under the [AWS free tier](https://aws.amazon.com/free/). So for an instance that is used a dozen or two hours a week, if you are in the AWS free tier, you can expect to be paying approximately $10/mo.
