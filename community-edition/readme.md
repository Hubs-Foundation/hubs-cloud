![Hubs Cloud Community Edition](https://uploads-prod.reticulum.io/files/05884d13-e5e8-4f64-9aca-792aae6d7734.png)

# Hubs Cloud Community Edition

Community Edition is a free tool designed to help developers deploy the full Hubs stack on cloud computing software of their choosing. Community Edition simplifies and automates most of the complex deployment process using [Kubernetes](https://kubernetes.io/), a containerized software orchestration system.

Community Edition is designed for developers capable of working with the full Hubs stack and of navigating complex application infrastructure. With Community Edition, developers are responsible for designing, building, hosting, and maintaining their software throughout its lifetime. In order to create a production-ready version of Hubs similar to Hubs Cloud, Developers using Community Edition will need to implement additional features and customizations outside of those listed in this repo. See ["Considerations for Production Environment"](https://github.com/mozilla/hubs-cloud/tree/master/community-edition#considerations-for-production-environment) for more details.

## Why Kubernetes

[Kubernetes](https://kubernetes.io/) is an industry standard for allowing developers to build, deploy, and scale applications efficiently and reliably. Benefits to Kubernetes include:

- [Portability, Extensibility, and Open Source](https://kubernetes.io/docs/concepts/overview/)
- [Availability in many cloud environments](https://kubernetes.io/docs/setup/production-environment/turnkey-solutions/)
- Many options for single server deployments, such as [Minikube](https://minikube.sigs.k8s.io/docs/start/), [K3s](https://k3s.io/), [Microk8s](https://microk8s.io/), and [kind](https://kind.sigs.k8s.io/)

## Prerequisites


- Node.js installed on your system. You can download it from [here](https://nodejs.org/).
- Clone the repository:
   ```sh
   git clone https://github.com/hubs-foundation/hubs-cloud
   ```
- Navigate to the project directory:
   ```sh
   cd hubs-cloud/community-edition
   ```
- Install the module dependencies:
   ```sh
   npm ci
   ```
Before applying the configuration file to your Kubernetes cluster, you will need to choose and configure the following services...
- A hosting service with a Kubernetes cluster to receive your Community Edition deployment spec.
- Kubernetes controls on your device. Install kubectl to interact with your Kubernetes cluster from [here](https://kubernetes.io/docs/tasks/tools/#kubectl)
- A DNS service to reach Hubs on a domain
- Port to expose services to client
  - TCP: 80, 443, 4443, 5349
  - UDP: 35000 -> 60000
- An SMTP service for login emails and accounts


## Deploy to Kubernetes

To deploy to your K8s cluster on your chosen hosting solution, follow these steps:

- In `input-values.yaml` edit `HUB_DOMAIN`, `ADM_EMAIL`, `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and optionally `SKETCHFAB_API_KEY` with the values for your site.  Change `NODE_COOKIE`, `GUARDIAN_KEY`, & `PHX_KEY` to unique random values, using a password generator if you have one handy.
- Run `npm run gen-hcce && npm run apply` to generate your configuration in `hcce.yaml` and apply it to your K8s cluster. From the output read your load balancer's external IP address.
- Expose the services
  - On your DNS service, create four A-records to route your domains to the external IP address of your load balancer
    - <root_domain>
    - assets.<root_domain>
    - stream.<root_domain>
    - cors.<root_domain>

- Configure your HTTPS certs
  - Option #1: bring your own
    - package the certs into kubernetes secrets named `cert-<domain>` under the deploy namespace
  - Option #2: use Hubs' certbotbot
    - run `npm run gen-ssl` to get an SSL certificate provisioned for your domains
      - If it fails with an error like `namespaces "hcce" not found`, it's probably because the namespace hasn't finished generating from your initial application of the hcce.yaml file, so try running it again in a few seconds.
    - Search for and comment out the `--default-ssl-certificate` line in `hcce.yaml` and then reapply `hcce.yaml` to kubernetes using `npm run apply`


## Managing Kubernetes

While working with Community Edition and kubernetes you will likely need to perform debugging and maintenance on your cluster, we have found these commands useful to this process.


### Info Commands
- `kubectl config current-context` - Displays the current context.
- `kubectl get ingress -n hcce` - Shows information about which of your pods are connected to the internet and how.
- `kubectl get secrets -n hcce` - Used to get information on your SSL certificates.
- `kubectl get deployment -n hcce` - Used to list the services of your kubernetes deployment and their status.
- `kubectl describe deployment <servicename> -n hcce` - Used to get information on a service in your deployment.
- `kubectl get pods -n hcce` - Used to list your pods and their status.
- `kubectl describe pod <podname> -n hcce` - Used to get information about a pod.  This includes which containers it has.
- `kubectl logs <podname> -n hcce` - Used to get the logs from a pod.
- `kubectl logs <podname> <containername> -n hcce` - Used to get the logs from a container within the pod.
- `kubectl top pods -n hcce` - Used to get information on the CPU, Memory, etc. of all your pods.
                               This may require additional configuration on your kubernetes provider to be used.
- `kubectl top pod <podname> -n hcce` - Used to get information on the CPU, Memory, etc. of a specific pod.
                                        This may require additional configuration on your kubernetes provider to be used.
- `kubectl get svc lb -n hcce` - Used to get info on your load balancer, IP addresses, ports, etc..
- `kubectl get pv -n hcce` - Used to list your persistent volumes.
- `kubectl describe pv <pv-name> -n hcce` - Used to get info on a persistent volume.
- `kubectl get pvc -n hcce` - Used to list your persistent volume claims.
- `kubectl describe pvc <pvc-name> -n hcce` - Used to get info on a persistent volume claim.

### Action Commands
- `kubectl apply -f hcce.yaml` - Used to apply your hcce.yaml config file to your kubernetes cluster.  This will update/create deployments and pods.
- `kubectl rollout restart deployment -n hcce` - Used to gracefully restart your deployment.
- `kubectl delete deployment --all -n hcce` - Used to delete all the services in your deployment.
- `kubectl delete deployment/<servicename> -n hcce` - Used to delete a specific service in your deployment.
- `kubectl delete pods --all -n hcce` - Used to delete all of your pods.
- `kubectl delete pod <podname> -n hcce` Used to delete a specific pod.
- `kubectl set image deployment/<servicename> <containername>=<dockerimage> -n hcce` - Used to set a docker image to one of your pods.  You will need to restart the deployment or delete the pod afterwards.
  - Example: `kubectl set image deployment/hubs hubs=hubsfoundation/hubs:stable-latest -n hcce`
- `kubectl scale deployments --all --replicas=0 -n hcce` - Used to scale down your kubernetes cluster, i.e. turn it off.
- `kubectl scale deployments --all --replicas=1 -n hcce` - Used to scale up your kubernetes cluster, i.e. turn it on.
> [!NOTE]
> Turning your kubernetes cluster off and on again can sometimes fix things when they're acting weird, e.g. if Spoke is displaying failed to fetch errors when uploading files.


### Graphical Clients

Kubernetes clusters can also be managed via GUI programs.  Here are some possibilities:

- [Podman Desktop](https://podman-desktop.io/) - Versions 1.8+.  Recent versions of Podman Desktop have both docker and kubernetes support.
- [Seabird](https://getseabird.github.io/)
- [K9s](https://k9scli.io/) - Terminal UI.
- [Headlamp](https://headlamp.dev/)
- [JET Pilot](https://www.jet-pilot.app/)


## Operations

If you need to edit `hcce.yaml` directly, for example
1. To have your cluster pull a fresh image whenever you deploy, change `imagePullPolicy` to `Always` for that image.
2. To work around certain SSL issues, comment out the line `- --default-ssl-certificate=hcce/cert-hcce`

After saving `hcce.yaml`, run

`npm run apply`

then

`kubectl get pods -n hcce`

If you just need to get the external IP address of your load balancer, run

`npm run get-ip`

## Guides from the Hubs Team and Community

### 1. Beginner's Guide to CE

The [Beginner's Guide to CE](https://docs.google.com/document/d/1BXSxTNFLjx8dtz26_OAFJParGdz8qTE2XvVAxwoJwrQ/edit?usp=sharing) takes you through the process of setting up Hubs, and all of it's required services, using the current Node.js version of Community Edition.  It is targeted at beginners, people without any programming experience, and the Windows operating system, but it should be useful to experienced developers, and those on other operating systems as well.  It uses DigitalOcean (for a kubernetes cluster), Porkbun (for the domain), and Scaleway (for the transactional email/smtp) as the additional services required by Hubs.

### 2. Deploying A "Hello-World" Instance Using Managed Kubernetes on GCP with AWS' DNS & SMTP

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

[The Hubs Team's case study](https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/) outlines the process of deploying your first, experimental instance on GCP's GKS. This tutorial walks you through the process of setting up DNS on AWS Route 53 and SMTP on AWS SES, deploying and trouble-shooting your instance on GCP, and configuring custom code & server settings.\
[Companion Video](https://youtu.be/8XNEWmf9tk4)

### 3. Community Edition Tips and Tricks by [@kfarr](https://github.com/kfarr)

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

[Documentation Awardee Kieran Farr's guide](https://hubs.mozilla.com/labs/tips-and-tricks-for-deploying-hubs-community-edition-to-google-cloud-platform/) shares the helpful tips and tricks he learned while following the Hubs Team's case study on GCP. This is an excellent repository of helpful commands and debugging techniques for new Kubernetes users.
[Companion Video](https://youtu.be/w4NlAhKaBrg)

### 4. Community Edition Helm Chart by [@Doginal](https://github.com/Doginal)

Documentation Awardee Alex Griggs maintains [an open-source Helm Chart for HCCE](https://github.com/hubs-community/mozilla-hubs-ce-chart). Helm is an abstraction above Kubernetes that improves maintainability, scalability, and ease-of-use of applications using K8s. Alex has also released three tutorials showing how to use his Helm chart to create production-ready CE deployments, including for large scale events:

1. [Deploying Mozilla Hubs CE on AWS with Ease: A Guide to the Personal Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-aws-with-ease-a-guide-to-the-personal-edition-helm-chart/)
2. [Deploying Mozilla Hubs CE on AWS with Ease: A Guide to the Scale Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-aws-with-ease-a-guide-to-the-scale-edition-helm-chart/)
3. [Deploying Mozilla Hubs CE on GCP with Ease: A Guide to the Personal Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-gcp-with-ease-a-guide-to-the-personal-edition-helm-chart/)\

[AWS Companion Video](https://youtu.be/0VtKQYXTrn4)\
GCP Companion Video (Coming Soon!)

### 5. Azure Hubs Community Edition Installation by [@TophoStan](https://github.com/TophoStan)

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

Documentation Awardee Stan Tophoven has published steps for uploading a Community Edition instance to Microsoft Azure's managed Kubernetes Platform.

1. [Installing Community Edition on Microsoft Azure AKS](https://hubs.mozilla.com/labs/installing-mozilla-hubs-community-edition-on-your-own-microsoft-azure-kubernetes-service/)
2. [Stan Tophoven's Guide to Deploying Community Edition on Azure AKS](https://www.youtube.com/watch?v=j8dQEEEX4OA)

### 6. Community Edition Setup on OVH by [@utopiah](https://fabien.benetou.fr/Tools/HubsSelfHosting)

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

Documentation Awardee Fabien Benetou has produced a guide for hosting Community Edition on OVH, including some excellent information on setup time, cost considerations, custom client deployment, and how Hubs can live on beyond Mozilla! Fabien has also produced long form and short form tutorial videos, including one in French.

1. [Written Document](https://fabien.benetou.fr/Tools/HubsSelfHosting)
2. [Long Form Tutorial in English](https://video.benetou.fr/w/c5YUiW7xaKAx91GPbCvWxd)
3. [Long Form Tutorial in French](https://video.benetou.fr/w/o8MDuxro6vaiT7Bu3PdyVw)
4. [Short Form Tutorial in English](https://video.benetou.fr/w/1vJC37pEhkEqJv6wU1h1c8)
5. [Custom Client Deployment](https://video.benetou.fr/w/qUkZiRTXGnu2xXXudJyPxM)

### 7. Azure Hubs Community Edition Installation by [@vvdt](https://github.com/vvdt)

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

Community Mamber Vincent van den Tol has released [instructions for installing Community Edition on Microsoft Azure](https://github.com/imedu-vr/hubs-docs/blob/main/azure_hubs_ce_installation.md), including persistent volumes, custom client deployment, and many helpful tips and tricks.

### 8. Import Assets from Hubs Cloud to CE by [chris-metabi](https://github.com/chris-metabi)

Chris from MeTabi [has created a guide](https://github.com/hubs-community/import_assets) for copying data from an existing Hubs Cloud instance and porting it to a Community Edition instance.

### 9. A "Hello-World" Instance With VM On GCP

> [!IMPORTANT]
> This guide is based on the bash version of Community Edition, to follow along you will need to use the bash scripts from https://github.com/Hubs-Foundation/hubs-cloud/tree/bash-version

##### Step 1: Make a kubernetes environment

Replace `hcce-vm-1` and `us-central1-a` with your desired name and zone. Check [the official doc](https://cloud.google.com/sdk/gcloud/reference/compute/instances/create) for more options.

##### login gcp

gcloud auth login

##### create a vm

`gcloud compute instances create hcce-vm-1 --zone=us-central1-a`

##### ssh to the vm

`gcloud compute ssh --project=hubs-dev-333333 --zone=us-central1-a geng-test-2`

##### prepare the vm

`sudo apt update && sudo apt install npm && sudo npm install pem-jwk -g`

##### install k3s without traefik -- read https://docs.k3s.io/ for more info

- `curl https://get.k3s.io/ | INSTALL_K3S_EXEC="--disable=traefik" sh -`

##### Step 2: Install k3s without traefik

- `curl https://get.k3s.io/ | INSTALL_K3S_EXEC="--disable=traefik" sh -`

- read https://docs.k3s.io/ for more info

##### Step 3: Deploy to kubernetes

- Add your services to `render_hcce.sh`
- Run `bash render_hcce.sh && sudo k3s kubectl apply -f hcce.yaml`

#### Step 3: connect the ingress
- find the vm's external ip
- create a-records to the dns
- makesure the required ports are exposed to the client

### example -- a "hello-world" instance with managed kubernetes on gcp
##### Step 1: make a kubernetes environment
replace `hcce-gke-1` and `us-central1-a` with your desired name and zone, check [official doc](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create) for more options

##### login gcp

gcloud auth login

##### create gke cluster

gcloud container clusters create hcce-gke-1 --zone=us-central1-a

###### get creds for kubectl

gcloud container clusters get-credentials --region us-central1-a hcce-gke-1

- Find the vm's external IP
- Expose IP to DNS
- Configure firewall

### 10. A "potentially-somewhat-production-ready" instance on AWS

- Coming soon!

## Considerations for Production Environment

- Infrastructure
  - Easy -- use managed kubernetes
  - Hard -- make it [production-ready](https://kubernetes.io/docs/setup/production-environment/)
- Security
  - Password and Keys
  - Add a WAF
- Scalability
  - Stateful services
    - PostgreSQL
      - use a managed pgsql ie. rds on aws or cloudsql on gcp
      - roll your own
    - Reticulum
      - use a network/shared storage for reticulum's /storage mount
  - Stateless Services (all except reticulum and pgsql)
    - Run multiple replicas
    - Use HPS
- Devops
  - The two yaml files in this repo are the entire infra on kubernetes. You may want to use git to track changes and an ops pipeline to auto deploy.
    - ex. Put the yaml file on a github repo and use github action to deploy to your hosting env.
  - Use dev env for staging/testing.
    - Use spot instances for nodes to save money.
    - Develop and integrate automated testing scripts into the ops pipeline
  - Configure devops for deploying custom versions of Spoke, Hubs, and Reticulum
```
