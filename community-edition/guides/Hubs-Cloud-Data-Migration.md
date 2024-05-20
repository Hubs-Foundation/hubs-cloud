# Hubs Cloud Data Migration to Community Edition

Hey everyone, this is [@mikemorran](https://github.com/mikemorran)!

This guide covers one method of manually transferring data from a Hubs Cloud (HC) instance on AWS to a Community Edition (CE) instance on GCP. While the details of this process are specific to HC on AWS and CE on GCP, the high level process should be effective when transferring data between _any_ instances of Hubs. The commands shown in this guide were executed on my 2022 Macbook Pro; You may need to adjust the commands and dependencies for your operating system.

The community and I covered this process in a Community Edition Setup Session on May 1, 2024. See the recording here: https://youtu.be/dmXhYtj2z34

This process will cover the following steps...

1. [Prerequisites](#prerequisites)
2. [Step A: Create a Database Dump On Your HC EC2 Instance](#step-a-create-a-database-dump-on-your-hc-ec2-instance)
3. [Step B: Download Your Dump File](#step-b-download-your-dump-file)
4. [Step C: Download Your EFS Files](#step-c-download-your-efs-files)
5. [Step D: Restore Your Database on CE](#step-d-restore-your-database-on-ce)
6. [Step E: Upload Your Files to CE Filestore](#step-e-upload-your-files-to-ce-filestore)
7. [Step F: Rewrite Remaining Asset Domains](#step-f-rewrite-remaining-asset-domains)
8. [Conclusion and Alternative Methods](#conclusion-and-alternative-methods)
9. [Recovering Your Private Key Pair (Optional)](#recovering-your-private-key-pair-optional)

### Prerequisites

1. This guide is using **a freshly provisioned CE instance** with reticulum writing /storage to [Google Filestore](https://cloud.google.com/filestore?hl=en) and pgbouncer connected to a PostgreSQL v.12 instance on [Cloud SQL](https://cloud.google.com/sql?hl=en). This guide also assumes that this CE instance currently has no essential data and that all existing data can be overwritten. This instance was created following this guide: https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/
2. This guide will transfer data from an HC instance on AWS and **you need to be able to execute into our HC's reticulum EC2 instance**. This requires you to have 2-Factor Authentication (2FA) [enabled on your HC instance](https://hubs.mozilla.com/docs/hubs-cloud-accessing-servers.html) and **access to the private key pair file** you created when setting up your instance. If, like me, you created your HC instance years ago and need to recover a lost private key pair file, [see these steps](#recovering-your-private-key-pair-optional).
3. [libsql](https://turso.tech/libsql) which can be installed on Mac using [Homebrew](https://brew.sh/): `brew install libsql`
4. [libpq](https://www.postgresql.org/docs/current/libpq.html) which can be installed on Mac using [Homebrew](https://brew.sh/): `brew install libpq`

### Step A: Create a Database Dump On Your HC EC2 Instance

To begin, we will need to package our existing PostgreSQL database on AWS RDS into a database dump. This file will be used to restore our database on our Cloud SQL PostgreSQL instance...

1. Execute into your HC's reticulum EC2 instance by running `ssh -i path/to/your/private/key/pem/file ubuntu@<your-ec2-instance-name>.<your-HC-domain>` and entering your 2FA code when prompted.
2. Once inside of your EC2 instance, run `nano pack-n-go.sh` to create a file with instructions to create the databse dump containing the following code...

```bash
set -e

function make_pg_dump(){
    IFS=' ' read -r -a array <<< $1
    host=""
    dbname=""
    user=""
    password=""
    for element in "${array[@]}"
    do
        IFS='=' read -r -a pair <<< "$element"
        key="${pair[0]}"
        value="${pair[1]}"
        case $key in
            host)
                host=$value
                ;;
            dbname)
                dbname=$value
                ;;
            user)
                user=$value
                ;;
            password)
                password=$value
                ;;
        esac
    done
    cmd='pg_dump postgres://'$user':'$password'@'$host':5432/'$dbname' -f /storage/pg_dump.sql'
    $cmd
    return
}

backupName="legacyhc"

# update psql
sudo sh -c 'echo "deb http://apt-archive.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update
sudo apt install postgresql -y

# dump db
! [ -f /storage/pg_dump.sql ] && dbCreds=$(cat /hab/svc/pgbouncer/config/pgbouncer.ini | grep -e 'polycosm_production = ') && make_pg_dump "$dbCreds"

# call to restore with phx_secret
secret_key=$(cat /hab/svc/reticulum/config/config.toml | grep -e 'secret_key = ' | sed 's/secret_key = //'|tr -d '"')
secret_key_base=$(cat /hab/svc/reticulum/config/config.toml | grep -e 'secret_key_base = ' | sed 's/secret_key_base = //'|tr -d '"')

echo "secret_key: $secret_key"
echo "secret_key_base: $secret_key_base"
cd /storage && ls -lha
```

3. Once you have saved the `pack-n-go.sh` script, run it with `sudo bash pack-n-go.sh`. `sudo` is required in order for the script to show your `secret_key` and `secret_key_base`. Wait for the script to finish executing.
4. Copy down the `secret_key` and `secret_key_base` printed by the script. These will later replace the `GUARDIAN_KEY` and `PHX_KEY`, respectively, in our CE deployment spec.
5. Verify that the dump was successful by looking for `pg_dump.sql` inside of `/storage` on your EC2 instance. Exit out of the connection.

### Step B: Download Your Dump File

1. Open a terminal on your device and run the following command to download the `pg_dump.sql` file to your device: `scp -r -i path/to/your/private/key/pem/file ubuntu@<your-ec2-instance-name>.<your-HC-domain>:/storage/pg_dump.sql /path/to/a/destination/directory/on/your/computer`
2. Verify that you have downloaded the `pg_dump.sql` file onto your computer.

### Step C: Download Your EFS Files

Next, we will need to download all of the files from our instance (images, videos, 3D models, etc) which are currently on AWS EFS. These files are currently located in `/storage` and can be viewed by executing into our HC reticulum EC2 instance. The only essential thing to download is `/storage/owned`, however you can also download `/storage/expiring` and `/storage/cached` if you wish (this guide will only detail how to download `/storage/owned`). The download may take several hours depending on the amount of data on your instance and requires you to maintain an open connection throughout the process (for me, it took about 4 hours to download 47GB of data on a 100mbps internet connection)...

1. Run the following command to begin the download process: `scp -r -i path/to/your/private/key/pem/file ubuntu@<your-ec2-instance-name>.<your-HC-domain>:/storage/owned /path/to/a/destination/directory/on/your/computer`
2. Let the process run until the download is complete.

### Step D: Restore Your Database on CE

At this point, we have successfully downloaded everything we need from our HC AWS instance and we can begin working to upload and restore these files to our CE GCP instance. We will start by restoring our database on our Cloud SQL PostgreSQL instance...

1. To initiate the upload, we first need to whitelist our connection over Public IP to our database. Open your Cloud SQL PostreSQL instance in GCP and select "Connections" in the left-hand toolbar. Next, select the "Networking" tab and add a new entry for "Authorized networks" with a name and your IP address. Make sure to click "Save" for this to take effect.
2. Run the following command to initialize the database restoration: `psql 'postgres://postgres:<your-db-password>@<your-db-public-ip>/retdb' -f /path/to/pg_dump.sql`
3. Wait for the restore process to complete. You should see a number of tables created, altered, and updated with copied data. The only error message you may encounter is about "rdsadmin", which can be ignored.

### Step E: Upload Your Files to CE Filestore

Next, we will upload our files to our CE reticulum's NFS storage on GCP Filestore. Just like the download, this process may take several hours depending on your internet speed and the amount of data being uploaded...

1. Rename the `owned` directory on your computer to `ownednew`. This is so that, when we upload, we are writing to a new directory instead of overwriting the existing `/storage/owned` directory. We will swap these later.
2. Execute into your CE reticulum pod with `kubectl exec -i <reticulum-pod-id> -n <your-namespace>` and add the `rsync` dependency by running: `apk add rsync`
3. Back in your computer's terminal, create a file called `krsync` containing the following kubectl wrapper code for rsync...

```bash
#!/bin/bash

if [ -z "$KRSYNC_STARTED" ]; then
    export KRSYNC_STARTED=true
    exec rsync --blocking-io --rsh "$0" $@
fi

# Running as --rsh
namespace=''
pod=$1
shift

# If user uses pod@namespace, rsync passes args as: {us} -l pod namespace ...
if [ "X$pod" = "X-l" ]; then
    pod=$1
    shift
    namespace="-n $1"
    shift
fi

exec kubectl $namespace exec -i $pod -- "$@"
```

4. Run the following command to begin the upload process: `/path/to/krsync -av --progress --stats /path/to/ownednew <reticulum-pod-id>@<your-namespace>:/storage/`
5. Wait for the upload process to complete.
6. Once the upload is complete, execute into your reticulum pod with `kubectl exec -i <reticulum-pod-id> -n <your-namespace>` and change `/storage/owned` to `/storage/ownedold` and `/storage/ownedold` to `/storage/owned` with the following command `mv /storage/<old-directory-name> /storage/<new-directory-name>`
7. Update your `PHX_KEY` and `GUARDIAN_KEY` values in your CE deployment spec with your `secret_key_base` and `secret_key`, respectively, and redeploy.

Now that we have uploaded our files, restored our SQL database, and redeployed our CE deployment spec, we should scale our pgbouncer, pgbouncer-t, and reticulum pods down and up to make the effects take place. When reticulum respawns its pod, you should see it go through a small data migration process. You can also use a DB GUI, like [dbeaver](https://dbeaver.io/), to view your new database tables.

### Step F: Rewrite Remaining Asset Domains

At this point in the process, we have successfully rehosted all of our files, however some parts of your instance may still be pointing towards the assets hosted on your old HC instance. This includes all asset urls referenced in your Spoke projects. We will follow these steps to rewrite the domain names of all incorrect references to point to the rehosted assets.

1. Search for `DashboardHeaderAuthorization` in your hcce.yaml file and replace `dashboard_access_key` with a value of your choosing. Re-deploy your hcce.yaml file once configured and make sure to respawn your reticulum pod so that the changes will take effect.
2. Execute into your reticulum pod: `kubectl exec -i <reticulum-pod-id> -n <your-namespace>`.
3. Run the following rewrite command from within your reticulum pod: `curl -H "x-ret-dashboard-access-key:'{your-access-key}'" -H "Content-Type: application/json" -X POST -d {"old_domain":"{your-old-hubs-cloud-domain}", "new_domain": "{your-new-domain}"} 'https://localhost:4000/api-internal/v1/rewrite_assets' -k -v`

### Conclusion and Alternative Methods

We have successfully migrated all of our HC data in-bulk to our CE instance. Any users who have uploaded assets to your HC instance in the past should be able to access them as normal on your CE instance.

The method outlined in this guide is by no means the most elegant solution. I chose to outline what I feel is the most simple and easily understandable method, but there are many ways you could accomplish the same results faster and more reliably. For instance, instead of downloading all of the files to your computer, you could [use a GCP bucket](https://cloud.google.com/sdk/gcloud/reference/storage/rsync) and tool your ret pod and ret EC2 instance to transfer data remotely. Additionally, you could avoid a middle-man completely by deploying an nfs pod in your CE instance, exposing the nfs service entrypoint with a new ingress route, and mounting the entrypoint to a directory within your HC reticulum EC2 instance and transfer the data directly.

### Recovering Your Private Key Pair (Optional)

If you have lost your SSH key pair, the simplest solution is to create a copy of your instance's EC2 launch configuration with a new key pair and update its Auto Scaling Group. You will be able to save the new key pair during this process:

1. Navigate to _EC2_ in the AWS dashboard, select _Instances_ in the left-hand toolbar, and select the Hubs Cloud instance you are attempting to migrate.

2. Within the instance's _Details_ tab, identify the instance’s _Auto Scaling Group Name_ (e.g. MozillaFest-app).

3. Navigate to _Auto Scaling Groups_ and click _Launch Configurations_, ignoring any warnings by clicking _View Launch Configurations_.

4. Click the checkbox next to the Launch Configuration that begins with the Auto Scaling Group Name of the EC2 instance you are attempting to migrate (e.g. “MozillaFest-AppLaunchConfiguration-DwoowR1eZ7Fi”).

5. Once selected, go to _Actions_ and select _Copy Launch Configuration_.

6. At the bottom of the next page in the _Key Pair (Login)_ section, select _Create a new key pair_ in the _Key Pair Options_ drop-down.

7. Input a name for the new key pair you would like to create and click _Download Key Pair_. <u>**Make sure you save this file to be used to SHH into your instance.**</u>

8. Click _Create launch configuration_. You will now attach the launch configuration to the Auto Scaling Group of your instance. Return to the _Auto Scaling Groups_ in the left-hand toolbar and click on the group that matches your EC2 instance.

9. In _Details_, scroll down to _Launch Configuration_ and click _Edit_. In the dropdown, select the new launch configuration and click update.

10. You now have to cycle your EC2 instance for the update to take place. The simplest way to do this is to terminate the current instance and wait for the Auto Scaling Group to create a new one. Go to _Instances_ in the left-hand toolbar, select the check mark next to your instance, click _Instance State_ and _Terminate_.

11. Wait 10-20 minutes for the new instance to be created. You should be able to see that it is using the new Key Pair in the instance's details. You should now be able to SSH into your instance.
