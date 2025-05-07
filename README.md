# Hubs Cloud Community Edition (CE)

Installation on Raspberry Pi 5, also general AMD64 and ARM64 systems

A fork of the [Hubs Foundation](https://hubsfoundation.org/) Hubs Cloud Community Edition with changes to support installation onto a Raspberry Pi.

The intent is that this repository, and associated repositories, are temporary forks for testing. Ideally when properly validated these repositories will be presented to Hubs Foundation upstream for inclusion in their codebase as a set of pull requests. 

It is understood that these changes could potentially break a lot of behaviours so we're very much looking for people who are interested in testing this out on Raspperry Pis, arm64, and amd64 platform architectures.

# Outstanding Issues

- We've had to disable WebRTC authentication in `coturn` and need to understand why inter-pod database lookups aren't working
- The HTTP LetsEncrypt `certbotbot` process isn't always reliable
- We should have some default media installed for users to get doing

# Installation (Raspberry Pi 5)

We're testing on a Raspberry Pi 5 with 8GB of RAM but this *should* work on a 4GB board and possibly even on a 2GB board variant.

## Setup a 'vanilla' Raspberry Pi OS image

Go through a standard imaging procedure such as using `rpi-imager` [link here](https://www.raspberrypi.com/software) to install a standard **64-bit** Raspberry Pi desktop [image](https://www.raspberrypi.com/software/raspberry-pi-desktop) 

**TIP:** You can use `rpi-imager` to edit the image settings before writing to the Pi and you might want to put in a default WiFi SSID and password so you can easily connect, and also consider adding a public key for security if you are comfortable with these things. I am going to use the following settings and you may need to pay attention to the user you install as and the hostname in the documentation below

| Setting | Value |
| ------- | ----- |
|Host Name | hubs-pi.local |
|User | hubs |

<img src="https://github.com/user-attachments/assets/12640669-7824-4482-ba27-8260c56747a1" width=50% />

Boot the Raspberry Pi and then login as the `hubs` user

**TIP:** If you're using the board without a display and keyboard you'll be logging in with the SSH protocol. You'll ethernet connect to your local network with a wired ethernet connection or you may have chosen to set WiFi credentials in the step above. To determine the IP address of the board you can ping the host name in this case `hubs-pi.local`. We use Linux here but I think if memory serves this is `hubs-pi.localdomain` on Windows computers.

```
$ ping hubs-pi.local
PING hubs-pi.local (192.168.0.174) 56(84) bytes of data.
```
Then use SSH or [Putty](https://www.putty.org/) to connect to this hostname or IP address and login

## Option 1: Automated Installation

Helper script **TBD**

## Option 2: Manual Installation

### Update installation to latest packages and install needed dependencies

Use the APT package manager to update and install as follows

```
sudo apt update
sudo apt -y upgrade
```

Install needed dependencies

```
sudo apt -y install git build-essential certbot ca-certificates curl npm htop
```

### Install Docker

Enter the following to install the Docker container manager. Details are taken from the instructions [here](https://docs.docker.com/engine/install/debian)

```
# Add Docker's official GPG key:
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```
sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
The next step is **critical** to that you can run docker containers as the non-root user. Details [here](https://docs.docker.com/engine/install/linux-postinstall/)

```
sudo usermod -aG docker $USER
```

NOTE: You need to log out and log back in for this change to take effect

Finally do a quick test that you can run a docker container

```
docker run hello-world
```
You should see something like this

```
hubs@hubs-pi:~$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
c9c5fd25a1bd: Pull complete
Digest: sha256:c41088499908a59aae84b0a49c70e86f4731e588a737f1637e73c8c09d995654
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (arm64v8)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

The Docker container engine is now installed !!!

### Install MiniKube (Kubernetes)

Now you need to install [MiniKube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Farm64%2Fstable%2Fbinary+download) which is a Kubernetes implementation for 'local' development.

Enter these commands

```
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-arm64
sudo install minikube-linux-arm64 /usr/local/bin/minikube && rm minikube-linux-arm64
```
Check you can run the `minikube` command successfully.

Start your cluster manually. We will automate this with a `systemd` service later on

```
minikube start
```

After a couple of minutes you should see something akin to

```
hubs@hubs-pi:~$ minikube start
* minikube v1.35.0 on Raspbian 12.10 (arm64)
* Automatically selected the docker driver. Other choices: none, ssh
* Using Docker driver with root privileges
* Starting "minikube" primary control-plane node in "minikube" cluster
* Pulling base image v0.0.46 ...
* Downloading Kubernetes v1.32.0 preload ...
    > preloaded-images-k8s-v18-v1...:  314.92 MiB / 314.92 MiB  100.00% 10.95 M
    > gcr.io/k8s-minikube/kicbase...:  452.84 MiB / 452.84 MiB  100.00% 9.10 Mi
* Creating docker container (CPUs=2, Memory=2200MB) ...
* Preparing Kubernetes v1.32.0 on Docker 27.4.1 ...
  - Generating certificates and keys ...
  - Booting up control plane ...
  - Configuring RBAC rules ...
* Configuring bridge CNI (Container Networking Interface) ...
* Verifying Kubernetes components...
  - Using image gcr.io/k8s-minikube/storage-provisioner:v5
* Enabled addons: storage-provisioner, default-storageclass
* kubectl not found. If you need it, try: 'minikube kubectl -- get pods -A'
* Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

Next install `minikube` `kubectl` support with

```
minikube kubectl -- get po -A
```

We will be using the `kubectl` command extensively to interact with our new kubernetes cluster. The instructions linked to above talk about adding an `alias` to the shell but this doesn't work well with the Hubs scripts. Instead we will use a trick I learnt from [BusyBox](https://busybox.net/) and symlink to the main `minikube` binary as follows

```
sudo ln -s /usr/local/bin/minikube /usr/local/bin/kubectl
```

Run up `kubectl` to test

```
kubectl get pods
```

The Kubernetes container orchestration engine is now installed !!!

### Copy the Hubs Cloud repository for Hubs Community Edition (CE) and install dependencies

It's probably best to `git checkout` whatever the latest release is from the repository or you could try out the `master` branch if you are feeling brave

At the time of writing (04/05/25) release `v0.0.2` commit hash is #953b85f7 (long form: #953b85f7cf2f67b7e2fb65d14d26ffbe942fbe5d)

```
cd ~
git clone git clone https://github.com/DynamicDevices/hubs-cloud.git
cd hubs-cloud
git checkout 953b85f7
```
To install needed `nodejs` dependencies use

```
cd ~/hubs-cloud/community-edition
npm ci
```
### Create your own Hub settings

We'll be mostly working in the `~/hubs-cloud/community-edition` so unless otherwise stated you can assume at the moment you're working  here.

Now you need to edit `input-values.yaml` to set your own needed values. This file is used to generate an `hcce.yaml` file which is what drives the `kubernetes` orchestration

There are various resources around but I will try to go through what needs to be changed from my perspective. Comments are inlined in the example file shown here.

```
# **CHANGE THIS** TO THE DOMAIN YOU WILL BE USING - NOTE YOU WILL NEED TO HAVE BOUGHT THIS DOMAIN AND BE ABLE TO MANAGE IT
HUB_DOMAIN: "pi.xrnet.hub"
# **CHANGE THIS** TO THE EMAIL ADDRESS YOU WISH TO USE TO ADMINISTER HUBS. THIS EMAIL ADDRESS AND ONLY THIS EMAIL ADDRESS WILL BE ABLE TO LOGIN AS ADMIN INIIALLY ALTHOUGH YOU CAN GRANT ADMIN RIGHTS TO OTHER USERS LATER
ADM_EMAIL: "admin@xrnet.hub"
Namespace: "hcce"
Container_Dockerhub_Username: "mozillareality"
Container_Tag: "stable-latest"
DB_USER: "postgres"
DB_PASS: "123456"
DB_NAME: "retdb"
DB_HOST: "pgbouncer"
DB_HOST_T: "pgbouncer-t"
PGRST_DB_URI: "postgres://$DB_USER:$DB_PASS@pgbouncer/$DB_NAME"
PSQL: "postgres://$DB_USER:$DB_PASS@pgbouncer/$DB_NAME"
# **CHANGE THIS** AND SET YOUR SMTP LOGIN DETAILS HERE
SMTP_SERVER: "changeMe"
SMTP_PORT: "changeMe"
SMTP_USER: "changeMe"
SMTP_PASS: "changeMe"
# **CHANGE THIS** TO GENERATE SOME RANDOM PASSWORDS FOR NODE_COOKIE / GUARDIAN_KEY / PHX_KEY
NODE_COOKIE: "changeMe"
GUARDIAN_KEY: "changeMe"
PHX_KEY: "changeMe"
# **OPTIONAL** YOU CAN GENERATE SKETCHFAB / TENOR KEYS TO PULL IN RESOURCES BUT I WOULD LEAVE THIS FOR NOW
SKETCHFAB_API_KEY: "?"
TENOR_API_KEY: "?"
GENERATE_PERSISTENT_VOLUMES: "Yes"
PERSISTENT_VOLUME_SIZE: "10Gi"
# **CHANGE THESE** TO OVERRIDE *ALL* THESE CONTAINERS AT THIS TIME TO USE THE DYNAMIC DEVICES IMAGES AS THESE SUPPORT ARM64 AND UPSTREAM DOES NOT AT THIS TIME
OVERRIDE_RETICULUM_IMAGE: "dynamicdevices/reticulum:latest"
OVERRIDE_POSTGREST_IMAGE: "dynamicdevices/postgrest:latest"
OVERRIDE_POSTGRES_IMAGE: "dynamicdevices/postgres:latest"
OVERRIDE_PGBOUNCER_IMAGE: "dynamicdevices/pgbouncer:latest"
OVERRIDE_HUBS_IMAGE: "dynamicdevices/hubs:latest"
OVERRIDE_SPOKE_IMAGE: "dynamicdevices/spoke:latest"
OVERRIDE_NEARSPARK_IMAGE: "dynamicdevices/nearspark:latest"
OVERRIDE_PHOTOMNEMONIC_IMAGE: "dynamicdevices/photomnemonic:latest"
OVERRIDE_DIALOG_IMAGE: "dynamicdevices/dialog:latest"
OVERRIDE_COTURN_IMAGE: "dynamicdevices/coturn:latest"
OVERRIDE_HAPROXY_IMAGE: "dynamicdevices/haproxy:latest"
```

**TIP:** Note above that the admin email is **exactly** what it says on the tin and you will need to log in with this email address initially to be able to administer your Hubs installation

Now you can create the `hcce.yaml` file from this `input-values.yaml` file with

```
npm run gen-hcce
```

**TIP:** You can edit the `hcce.yaml` file directlly and then redeploy your `kubernetes cluster` so you can view the preceding step as just making your life a little easier. Remember that any changes to `hcce.yaml` will be lost when you run `npm run gen-hcce` again.

#### Additional step when using Gmail for SMTP email

I use GMail with app tokens and the default setup does not work for me. I found this was because a Hubs mmailer component seems to be trying to use TLS not SSL to talk to Google and for some reason that doesn't work. If you run into problems with email then I suggest you edit the `hcce.yaml` as follows to add the `tls` and `ssl` keys

```
    [ret."Elixir.Ret.Mailer"]
    server = "<SMTP_SERVER>"
    port = "<SMTP_PORT>"
    username = "<SMTP_USER>"
    password = "<SMTP_PASS>"
    tls = false
    ssl = true
```

**TBD**: Add in some notes on how we can view the logs in Reticulum which will show any errors, e.g. with passwords, when Hubs tries to send out email validation links

**TIP:** It is possible and documented elsewhere how to view logs to get the validation code to avoid having to have emailing working but I haven't had much luck with that, it makes it hard to impossible for others to join you in your Hub rooms, so I am not spending time documenting this process here.

### Deploy Hubs with Kubernetes

Now you have your `hcce.yaml` file you can use this to to a pre-deployment of your `kubernetes` cluster with

```
npm run apply
```

This won't actually work at this time as you don't have a needed webserver certficate which will cause the `coturn` pod to block.

This can take a while and things can sometimes get stuck in my experience. With luck you will see something like this

```
hubs@hubs-pi:~/hubs-cloud/community-edition$ npm run apply

> script@1.0.0 apply
> node apply/index.js && node get_ip/index.js

namespace/hcce created
secret/configs created
persistentvolume/pgsql-pv created
persistentvolume/ret-pv created
persistentvolumeclaim/pgsql-pvc created
persistentvolumeclaim/ret-pvc created
Warning: annotation "kubernetes.io/ingress.class" is deprecated, please use 'spec.ingressClassName' instead
ingress.networking.k8s.io/ret created
ingress.networking.k8s.io/dialog created
ingress.networking.k8s.io/nearspark created
configmap/ret-config created
deployment.apps/reticulum created
service/ret created
service/pgsql created
deployment.apps/pgsql created
deployment.apps/pgbouncer created
service/pgbouncer created
deployment.apps/pgbouncer-t created
service/pgbouncer-t created
deployment.apps/hubs created
service/hubs created
deployment.apps/spoke created
service/spoke created
deployment.apps/nearspark created
service/nearspark created
service/speelycaptor created
deployment.apps/photomnemonic created
service/photomnemonic created
secret/configs configured
deployment.apps/dialog created
service/dialog created
deployment.apps/coturn created
service/coturn created
configmap/haproxy-tcp-config created
configmap/haproxy-config created
secret/cert-hcce created
deployment.apps/haproxy created
service/lb created
serviceaccount/haproxy-sa created
clusterrole.rbac.authorization.k8s.io/haproxy-cr created
clusterrolebinding.rbac.authorization.k8s.io/haproxy-rb created
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
waiting on coturn, dialog, haproxy, hubs, nearspark, pgbouncer, pgbouncer-t, pgsql, photomnemonic, reticulum, spoke
```

**TIP**: On a slower system such as Raspberry Pi this can take a *while*. Ten minutes would not be unreasonable, or perhaps even longer as it is pulling down some fairly larger images from the Docker Hub.

**TIP**: As each of these kubernetes pods starts up, the list will get smaller. It can also get *longer* if those pods are failing to start and restarting for some reason. You can CTRL-C out of the script at this point if you wish. It won't stop the pods starting up and instead you can run some `kubectl` commands to try to work out what's failing.

If all goes well you should end up waiting only on `coturn` as we need to follow another step to generate the webserver TLS certificates to enble this pod to work (**TBD** I should really fix this so it starts without the cert present.)

```
waiting on coturn
waiting on coturn
```
As this point if you haven't already done this you can CTRL-C out of the script to have a look at what has happened.

## Troubleshooting Kubernetes pod deployment

`kubectl` is your friend here. There are a number of commands you can use to look at what is happening with your services, deployments and pods.

**TIP** Hubs CE uses the `hcce` kubernetes namespace. You need to reference this in all your command usages or it will tell you it can't find what you are looking for

To see what pods are running and what are failed or restarting use

```
kubectl -n hcce get pods
```

At this point you should see something like this

```
hubs@hubs-pi:~/hubs-cloud/community-edition$ kubectl -n hcce get pods
NAME                             READY   STATUS              RESTARTS   AGE
coturn-b955664dd-bwdt4           0/1     ContainerCreating   0          10m
dialog-79bcc78b99-79jk6          1/1     Running             0          10m
haproxy-f9dc558b6-6rpvd          1/1     Running             0          10m
hubs-5ddd84c5f9-n8cnw            1/1     Running             0          10m
nearspark-66cb5bdf56-b4vbx       1/1     Running             0          10m
pgbouncer-6548f4b689-tt7g8       1/1     Running             0          10m
pgbouncer-t-5b9598bdb6-jgqpv     1/1     Running             0          10m
pgsql-5b958bb9bd-mnb2v           1/1     Running             0          10m
photomnemonic-7cd74669cc-b62gv   1/1     Running             0          10m
reticulum-7bc89f9879-b4hjh       2/2     Running             0          10m
spoke-77fb888c9d-5924m           1/1     Running             0          10m
```

You can get more detailed info on what is happening with a pod with something like this (where you are using the pod name that you are being shown as the suffix changes across deployments)

```
kubectl -n hcce describe pod coturn-b955664dd-bwdt4
```

In this case we see

```
Events:
  Type     Reason       Age                 From               Message
  ----     ------       ----                ----               -------
  Normal   Scheduled    11m                 default-scheduler  Successfully assigned hcce/coturn-b955664dd-bwdt4 to minikube
  Warning  FailedMount  61s (x13 over 11m)  kubelet            MountVolume.SetUp failed for volume "certs" : secret "cert-pi.xrhub.org" not found
```
This is correct at this point as we've not created the `kubernetes secrets` for our webserver TLS keys

### Setup systemd services to run minikube and the Minikube tunnel automatically

You probably want your `kubernetes` cluster to come up automatically and **CRITICALLY YOU NEED TO CONNECT MINIKUBE TO THE OUTSIDE WORLD**

This is **SUPER IMPORTANT** as `minikube` doesn't automatically connect up to the external IP address on the board you are installing on here. This can lead to much head scratching in my personal experience.

I've provided two `systemd` services to run up `minikube` and `minikube tunnel` on startup and we will install these here.

Edit the `minikube` service file with

```
sudo nano /etc/systemd/service/minikube.service
```

Then enter the following information

```
[Unit]
Description=Kickoff Minikube Cluster
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/minikube start
RemainAfterExit=true
ExecStop=/usr/local/bin/minikube stop
StandardOutput=journal
User=hubs
Group=hubs

[Install]
WantedBy=multi-user.target
```

**TIP** If you have changed your installation user name then you need to edit both `User` and `Group` to correspond to this

Next do the same for the `minikube-tunnel` service

```
sudo nano /etc/systemd/service/minikube-tunnel.service
```

```
[Unit]
Description=Minikube Tunnel
After=minikube.service

[Service]
Type=simple
ExecStart=/usr/local/bin/minikube tunnel --bind-address '10.0.0.40'
RemainAfterExit=true
StandardOutput=journal
User=hubs
Group=hubs

[Install]
WantedBy=multi-user.target
```

**TIP** As before you are going to potentially need to change the `User` and `Group` to your user. Also **CRITICALLY IMPORTANT** you need to change the `--bind-address` to the public ethernet/WiFi interface on your board. This is almost certainly the IP address you get when you ping `hubs-pi.local`. (I am making a set of assumptions here, that you are running on a local network and will be port forwarding to the board from your router. You may alternatively have the board on a public internet facing IP address in which case you will use that IP address. Things get a bit more complicated if you are routing through subnets or VPNs in something like AWS but ask me if you run into trouble here).

Next, the `minikube-tunnel` service needs to be able to elevate its permissions to perform it's job. I am not sure of the most secure way to do this to be honest but the approach I have taken is to allow the service user to access the needed binaries without a password but no others.

So, for this edit `/etc/sudoers`, comment out the `%sudo` group line and add the two hubs lines

```
sudo nano /etc/sudoers
```

**IMPORTANT** We seem to need to disable `sudo` group access to achieve our goals. Note the `#` prefixing the `%sudo` line. If you do not explicity add the `hubs ALL=` line then your hubs user will **NO LONGER BE ABLE TO SU-DO** and you will either be hacking SD Card images or reinstalling. **So be careful here...**

Again the two usages of 'hubs' here would change to your own user if not hubs 
```
# Allow members of group sudo to execute any command
#%sudo  ALL=(ALL:ALL) ALL

hubs        ALL=(ALL:ALL) ALL
hubs ALL=NOPASSWD: /usr/local/bin/minikube, /usr/bin/ssh
```

Lastly enable these services to run on startup and reboot

```
sudo systemctl enable minikube
sudo systemctl enable minikube-tunnel
```

And reboot...

```
sudo reboot
```

Log back in and check these services started up OK with

```
sudo systemctl status minikube
sudo systemctl status minikube-tunnel
```

If there are problems you can dig into what has happened by looking at the logs

```
sudo journalctl -u minikube
sudo journalctl -u minikube-tunnel
```

You've now connected up your Hubs CE `kubernetes` cluster to the world outside the box! (although perhaps not the wider internet unless you have setup port forwarding on your router!)

### Enabling Internet access to your box

**SO THIS IS POTENTIALLY VERY INSECURE AND YOU SHOULD NOT BE DOING THIS UNLESS YOU UNDERSTAND THE RISKS. YOU ARE POTENTIALLY LETTING HACKERS INTO YOUR BOX TO ACCESS ALL YOUR HOME/WORK SYSTEMS. BE WARNED**

I don't really want to get into the depths of network address translation and port forwarding as it's covered extensively on the internet so go and read up there.

In brief

- your best option is to put your box on a public internet IP address with no access to anything else such as your internet intranet
- alternatively if you know your network infrastructure you could setup a virtual private network segment
- what many home users will end up doing is to port forward the TCP and UDP ports Hubs CE needs via your router onto the IP address of the box in your home network. I reitarate **THIS PUTS YOUR COMPUTER SYSTEMS AT RISK AND YOU TAKE THIS STEP ENTIRELY AT YOUR OWN RISK**. You should find the documentation on how to configure port forwarding at your internet provider's website. If you don't at least have an idea what this term means **PLEASE** don't do it.

The port forwarding and firewalling setup that I use with Hubs looks like this (this is a dump from the `ufw` firewall I am using on a development box)

**NOTE** I suspect that we don't need all these ports but this is what I am using at present and it works for me [**TBD:** Correct to limit to needed ports]

| To                        |  Action  |     From |
| --                        |  ------  |     ---- |
| OpenSSH(22)               |  ALLOW   |     Anywhere |
| 443/tcp                   |  ALLOW   |     Anywhere |
| 80/tcp                    |  ALLOW   |     Anywhere |
| 4443                      |  ALLOW   |     Anywhere |
| 49152:65535/tcp           |  ALLOW   |     Anywhere |
| 49152:65535/udp           |  ALLOW   |     Anywhere |
| 25565/udp                 |  ALLOW   |     Anywhere |
| 25565/tcp                 |  ALLOW   |     Anywhere |
| 35000:60000/udp           |  ALLOW   |     Anywhere |
| 5349/tcp                  |  ALLOW   |     Anywhere |
| 4443/tcp                  |  ALLOW   |     Anywhere |
| 7000/tcp                  |  ALLOW   |     Anywhere |
| 3478                      |  ALLOW   |     Anywhere |
| 9100/tcp                  |  ALLOW   |     Anywhere |
| 21114:21119/tcp           |  ALLOW   |     Anywhere |
| 8000/tcp                  |  ALLOW   |     Anywhere |
| 21116/udp                 |  ALLOW   |     Anywhere |
| 8883                      |  ALLOW   |     Anywhere |
| 8081                      |  ALLOW   |    Anywhere |

**MORE SECURITY** I would also **STRONGLY** suggest you do **NOT** allow global access to your SSH port (for remote login). I would either not include this, or allow a limited number of IP addresses to connect. I would **ALSO** disable password authentication for OpenSSH allowing only public key authenticated access. Again these topics are discussed widely on the Internet but contact me if you run into trouble.
 
### Creating TLS keys for the Hubs CE webserver domains

#### Some background

There are lots of good introductions to how authentication works with web servers. In essence the secure `http://` protocol `https;//` uses mathematically generated cryptography keys to verify that the web server you are communicating with is actually the real webserver, as a fake webserver wouldn't be able to generate a "trusted" key. In essence you create a certificate signing request (CSR) that you submit to a signing certificate authority (CA) which is highly trusted (e.g. by the web browser). The CA verifies that you are who you say you are, and gives you the signed certificate which you then use on your server. When a client comes along you had it the certificate and it can mathematically verify that the CA signed what you just provided. It trusts the CA so if if knows mathematically the CA signed your certificate then it trusts that your server is who it says it is.

The way the client or browser talks to the server is using the server name, which includes your domain name, for example a domain name might be `xrhub.com`. The certificate provided by the server is signed with this domain name so when the client talks to the server with that domain name, found via a domain name loopup on a DNS server, and the server returns a certificate signed for that domain name by a trusted authority the client can see the two match and it is talking to the place it should be talking to.

The key thing here is you have to have a domain name to generate the certificate against. You can also generate certficates for subdomains e.g. `dev.xrhub.org` or you can generate wildcard certficates which match any subdomain e.g. `*.xrhub.org`.

It is also possible for you to self-sign a certificate but in this case any general client won't trust the signing of the certificate as you (as the signer) are not in its default list of trusted CAs. You can set this up but obviously this is specific to each client not any random client across the internet that might connect to your server.

So there are different processes to obtain a domain name, and different processes to create a signing request and get that signed by a certificate signing authority.

One of the ways many people use nowadays is to use [Certbot](https://certbot.eff.org/pages/about) from [LetsEncrypt](https://letsencrypt.org/) which is a widely trusted certificate signing authority.

The standard http-based process you go through to generate your certificates is

- Buy a domain name from a domain name provider (e.g. [Cloudflare](cloudflare.com) is one I use)
- Use the domain name provider portal to map the domain name (and any subadomains) to the internet IP address of your server. This can take from seconds to hours to propogate around the internet depending on your provider
- Setup any firewalling to allow web traffic through to your server on the standard http port 80 (and for your TLS https:// server on port 443)
- Run certbot on the server asking for a certficate for the domain name you've mapped to the IP address
- Depending on the options you give it, certbot either interacts with the webserver running on your server, or runs it's own internal webserver
- It then asks the Letsencrypt systems to connect to the server running at the domain you are asking to be validated and it requests a value - a `secret`
- This value is provided by your webserver or certbot (as setup by certbot) and thus Letsencrypt knows you control the server at the domain it is validating and it issues the certificate

  There is an alternative DNS based option which doesn't require use of or connection to your own webservers. In this case

  - Your domain name provider almost certainly provides an API to programmatically modify your domain so you obtain an API token to access this
  - You use a certbot plugin that knows how to talk to your domain name provider API
  - When you run certbot it interacts with your domain settings via the API and stores your unique value there as a specific kind of record, a TXT entry
  - Letsencrypt waits for that value to propgate (again this could taken time but usually happens within say 30s) and then checks for it's presence
  - With that value on your domain settings Letsencrypt knows that you are in control of the domain and will issue you a certificate
 
**Key differences** here are that the http method is more automated whereas the DNS method is provider specific and requires you to setup API tokens. **However** with the DNS method you can request **wildcard** certificates which means you can use a single certificate for all your subdomains, which can be easier to configure.

Hubs uses the http mechanism, whereas I have a little [script](https://github.com/DynamicDevices/hubs-cloud/blob/master/community-edition/make-certs.sh) I wrote which talks to my Cloudflare provider to issue wildcard certificates

#### The standard (http) process

You can use some Hubs CE automation to generate the certificates. This uses the http method with certbot which generates files for each domain (certificate file itself and your private key file). These files are then stored into the `kubernetes` system as TLS `secrets` which are then used by the various pods running webservers. There are a number of domains which you need to setup to point to your server IP address with your domain name provider. This is done  by creating what are called A records which map a domain name to an IP address.

If you are running your system on your home network then you will want to:

a) obtain the public IP address for your home network e.g. using https://myip.dk

b) port forward the needed ports mentioned above to the IP address of your Raspberry Pi on your home network, found with either `ifconfig` or `ip a`. It will likely be of the form `192.168.x.x. You may also want to change your router configuration, if possible, to ensure that the IP address it automatically assigns to your Hubs Pi doesn't change in future or you will have to change your internal port forwarding setup when it does change.

| Domain | Example |
| ------ | ------- |
| $base  | xrhub.org |
| stream.$base | stream.xrhub.org |
| assets.$base | assets.xrhub.org |
| cors.$base | cors.xrhub.org |

You will need to read the documentation at your domain name provider site to know how to do this. When you've done this you can check by pinging the domain name and assuming your server isn't firewalling ICMP ping requests and responses you will get a response from the correct IP address e.g.

```
$ ping assets.xrhub.org
PING assets.xrhub.org (185.135.107.85) 56(84) bytes of data.
64 bytes from cust-does-liv.fab.liv.balticbroadband.com (185.135.107.85): icmp_seq=1 ttl=47 time=50.7 ms
64 bytes from cust-does-liv.fab.liv.balticbroadband.com (185.135.107.85): icmp_seq=2 ttl=47 time=40.5 ms
```

With this setup correctly you can now run certbot with the command

```
npm run gen-ssl
```

At this point if all is well a pod called `certbotbot-http` will be run up multiple times for the needed domains, run certbot and a webserver in this pod whereupon letsencrypt will connect to the pod and issue the domain certificate which will then be stored into the kubernetes infrastructure as a TLS key.

There are multiple things that can go wrong here in term of DNS setup, firewalling, port forwarding, minikube tunnel being setup correctly on the right IP address and so forth. It was the hardest step for me and I'm open to try to help you diagnose your problems if you want to contact me.

If all goes well you will see some log messages akin to the following

```
$ npm run gen-ssl

> script@1.0.0 gen-ssl
> node ssl_script/index.js

starting script
Generating SSL certificate for: pi.xrhub.org
Error from server (NotFound): pods "certbotbot-http" not found
certbotbot-http pod not present.  This is fine
cbb.yaml file generated successfully.
bad pod status: Pending
Generating SSL certificate for: assets.pi.xrhub.org
cbb.yaml file generated successfully.
.....:
NAME                       TYPE                DATA   AGE
cert-assets.pi.xrhub.org   kubernetes.io/tls   2      11s

Generating SSL certificate for: stream.pi.xrhub.org
cbb.yaml file generated successfully.
.....:
NAME                       TYPE                DATA   AGE
cert-stream.pi.xrhub.org   kubernetes.io/tls   2      12s

Generating SSL certificate for: cors.pi.xrhub.org
cbb.yaml file generated successfully.
.....:
NAME                     TYPE                DATA   AGE
cert-cors.pi.xrhub.org   kubernetes.io/tls   2      8s

```

At this point you can check your TLS secrets have been generated with

```
$ kubectl -n hcce get secrets
NAME                       TYPE                DATA   AGE
cert-assets.pi.xrhub.org   kubernetes.io/tls   2      8m32s
cert-cors.pi.xrhub.org     kubernetes.io/tls   2      6m26s
cert-hcce                  kubernetes.io/tls   2      21h
cert-pi.xrhub.org          kubernetes.io/tls   2      2m23s
cert-stream.pi.xrhub.org   kubernetes.io/tls   2      7m31s
configs                    Opaque              20     21h
```

And you can see an individual secret with something like

```
hubs@hubs-pi:~/hubs-cloud/community-edition$ kubectl -n hcce describe secret cert-pi.xrhub.org
Name:         cert-pi.xrhub.org
Namespace:    hcce
Labels:       <none>
Annotations:  <none>

Type:  kubernetes.io/tls

Data
====
tls.crt:  3627 bytes
tls.key:  1704 bytes
```

**TIP:** Sometimes this doesn't completely work and you need to re-run the command. The most common problem is that for some reason letsencrypt is not able to connect to the webserver running on your system to retrieve its secret. If you are getting lots of dots something in the container is going wrong and you need to view the logs with

```
kubectl -n hcce logs certbotbot-http -f
```

**TIP**: If you are testing numbers of times at some point Letsencrypt will rate limit you for generating too many queries and you'll have to wait to carry on. You can see this in the logs too if it is happening

At this point (hopefully) you have your web-server certificates!

Now you need to modify your `hcce.yaml` file to remove the default certificate line, so `haproxy` will use the certicates you just generated

```
nano ~/hubs-cloud/community-edition/hcce.yaml
```

Around line 1312 comment out this text

```
#            - --default-ssl-certificate=hcce/cert-hcce
```

Note that this will revert back if you run `npm gen-hcce` again in future, for example if you need to update the `hcce.yaml` with changes `input-values.yaml`. (Although you can just edit `hcce.yaml` directly if you are feeling confident.

Now you are in a position to redeploy your cluster with

```
npm run apply
```

This should run up `coturn` successfully now as you have the needed TLS secret

```
clusterrole.rbac.authorization.k8s.io/haproxy-cr unchanged
clusterrolebinding.rbac.authorization.k8s.io/haproxy-rb unchanged
all deployments ready
load balancer external IP address: 127.0.0.1
```

If you check the status of your pods you should see they are all running

```
$ kubectl -n hcce get pods
NAME                             READY   STATUS      RESTARTS      AGE
certbotbot-http                  0/1     Completed   0             5m31s
coturn-b955664dd-bwdt4           1/1     Running     0             21h
dialog-79bcc78b99-79jk6          1/1     Running     1 (20h ago)   21h
haproxy-f9dc558b6-6rpvd          1/1     Running     1 (20h ago)   21h
hubs-5ddd84c5f9-n8cnw            1/1     Running     1 (20h ago)   21h
nearspark-66cb5bdf56-b4vbx       1/1     Running     1 (20h ago)   21h
pgbouncer-6548f4b689-tt7g8       1/1     Running     1 (20h ago)   21h
pgbouncer-t-5b9598bdb6-jgqpv     1/1     Running     1 (20h ago)   21h
pgsql-5b958bb9bd-mnb2v           1/1     Running     1 (20h ago)   21h
photomnemonic-7cd74669cc-b62gv   1/1     Running     1 (20h ago)   21h
reticulum-7bc89f9879-b4hjh       2/2     Running     2 (20h ago)   21h
spoke-77fb888c9d-5924m           1/1     Running     1 (20h ago)   21h
```

**TIP**: If things go wrong it can be useful to remove all the pods which can be done by deleting the deployments with

```
 kubectl -n hcce delete deployment coturn dialog haproxy hubs nearspark pgbouncer pgbouncer-t pgsql photomnemonic reticulum spoke
```

Then you can redeploy as above with

```
npm run apply
```

If you do this at any point after setting up your Hubs unit you should be safe in that it shouldn't delete any of your stored data (but don't take my word for that if things go wrong)

**TIP**: If things go really seriously wrong you might want to completely uninstall `minikube` which **WILL** lose any stored data from your Hubs server. If we're just in setup mode we don't care so much about that.

```
minikube delete
```

then

```
minikube start
```
**TIP** If you do this you will need to regenerate the certificates before you deploy the cluster with `npm run apply`

I would tend to reboot the Pi at this point to make sure everything runs up OK

```
sudo reboot
```
And if all has gone well you now have a running Hubs Server !!! It looks as though some of the links are broken as you need to provide images in the Admin->Branding section

![image](https://github.com/user-attachments/assets/bfc2fd63-98d9-4622-a19b-4613ced0a295)

Enter your admin email from the `input-values.yaml` and if all is working you'll receive an email verification link

**TIP:** If you don't get the email you need to check what's failing in the `reticulum` pod with

```
kubectl -n hcce logs reticulum-xxxx -f
```

Once logged in you can head over to the admin panel to start adding your branding images, change settings and start playing with Hubs CE !!!

![image](https://github.com/user-attachments/assets/e7c016f0-27a7-4f28-b4a7-3e27fb1c9f6b)

There is of course much more to explain about how to interact with hubs and for this I suggest you go to the Hubs Foundation [documentation](https://docs.hubsfoundation.org/welcome.html)

A final note... It has taken me a lot longer than I originally anticipated to figure all this out and to document it to help others. It motivates me to spend time documenting when I know that I've been of some help, so if you do find this walkthrough useful please drop me a line to let me know!
