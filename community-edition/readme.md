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

Before deploying the charts in this repo, you will need to choose and configure the following services...

- A hosting service with a Kubernetes cluster to receive your Community Edition deployment spec.
- Kubernetes controls on your device
- A DNS service to reach Hubs on a domain
- Port to expose services to client
  - TCP: 80, 443, 4443, 5349
  - UDP: 35000 -> 60000
- An SMTP service for login emails and accounts

## Deploy to Kubernetes

To deploy to your K8s cluster on your chosen hosting solution, follow these steps:

- Add your chosen services into `render_hcce.sh`
- Run `bash render_hcce.sh && kubectl apply -f hcce.yaml`
- Expose the services

  - Run `kubectl -n <hcce_namespace> get svc lb` to find your load balancer's external ip
  - On your DNS service, create four A-records to route your domains to the external ip of your K8s cluster
    - <root_domain>
    - assets.<root_domain>
    - stream.<root_domain>
    - cors.<root_domain>

- Configure your HTTPS certs
  - Option #1: bring your own
    - package the certs into kubernetes secrets named `cert-<domain>` under the deploy namespace
  - Option #2: use Hubs' certbotbot
    - edit configs into `cbb.sh` with a text editor
    - `bash cbb.sh`

## Guides from the Hubs Team and Community

### 1. Deploying A "Hello-World" Instance Using Managed Kubernetes on GCP with AWS' DNS & SMTP

[The Hubs Team's case study](https://hubs.mozilla.com/labs/community-edition-case-study-quick-start-on-gcp-w-aws-services/) outlines the process of deploying your first, experimental instance on GCP's GKS. This tutorial walks you through the process of setting up DNS on AWS Route 53 and SMTP on AWS SES, deploying and trouble-shooting your instance on GCP, and configuring custom code & server settings.\
[Companion Video](https://youtu.be/8XNEWmf9tk4)

### 2. Community Edition Tips and Tricks by [@kfarr](https://github.com/kfarr)

[Documentation Awardee Kieran Farr's guide](https://hubs.mozilla.com/labs/tips-and-tricks-for-deploying-hubs-community-edition-to-google-cloud-platform/) shares the helpful tips and tricks he learned while following the Hubs Team's case study on GCP. This is an excellent repository of helpful commands and debugging techniques for new Kubernetes users.
[Companion Video](https://youtu.be/w4NlAhKaBrg)

### 3. Community Edition Helm Chart by [@Doginal](https://github.com/Doginal)

Documentation Awardee Alex Griggs maintains [an open-source Helm Chart for HCCE](https://github.com/hubs-community/mozilla-hubs-ce-chart). Helm is an abstraction above Kubernetes that improves maintainability, scalability, and ease-of-use of applications using K8s. Alex has also released three tutorials showing how to use his Helm chart to create production-ready CE deployments, including for large scale events:

1. [Deploying Mozilla Hubs CE on AWS with Ease: A Guide to the Personal Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-aws-with-ease-a-guide-to-the-personal-edition-helm-chart/)
2. [Deploying Mozilla Hubs CE on AWS with Ease: A Guide to the Scale Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-aws-with-ease-a-guide-to-the-scale-edition-helm-chart/)
3. [Deploying Mozilla Hubs CE on GCP with Ease: A Guide to the Personal Edition Helm Chart](https://hubs.mozilla.com/labs/deploying-mozilla-hubs-ce-on-gcp-with-ease-a-guide-to-the-personal-edition-helm-chart/)\

[AWS Companion Video](https://youtu.be/0VtKQYXTrn4)\
GCP Companion Video (Coming Soon!)

### 4. Azure Hubs Community Edition Installation by [@vvdt](https://github.com/vvdt)

Community Mamber Vincent van den Tol has released [instructions for installing Community Edition on Microsoft Azure](https://github.com/imedu-vr/hubs-docs/blob/main/azure_hubs_ce_installation.md), including persistent volumes, custom client deployment, and many helpful tips and tricks.

### 5. Import Assets from Hubs Cloud to CE by [chris-metabi](https://github.com/chris-metabi)

Chris from MeTabi [has created a guide](https://github.com/hubs-community/import_assets) for copying data from an existing Hubs Cloud instance and porting it to a Community Edition instance.

### 6. A "Hello-World" Instance With VM On GCP

##### Step 1: Make a kubernetes environment

Replace `hcce-vm-1` and `us-central1-a` with your desired name and zone. Check [the official doc](https://cloud.google.com/sdk/gcloud/reference/compute/instances/create) for more options.

```
### login gcp
gcloud auth login
### create a vm
`gcloud compute instances create hcce-vm-1 --zone=us-central1-a`
### ssh to the vm
`gcloud compute ssh --project=hubs-dev-333333 --zone=us-central1-a geng-test-2`
### prepare the vm
`sudo apt update && sudo apt install npm && sudo npm install pem-jwk -g`
### install k3s
```

##### Step 2: Install k3s without traefik

- `curl https://get.k3s.io/ | INSTALL_K3S_EXEC="--disable=traefik" sh -`

- read https://docs.k3s.io/ for more info

##### Step 3: Deploy to kubernetes

- Add your services to `render_hcce.sh`
- Run `bash render_hcce.sh && sudo k3s kubectl apply -f hcce.yaml`

##### Step 4: Connect the ingress

- Find the vm's external IP
- Expose IP to DNS
- Configure firewall

### 7. A "potentially-somewhat-production-ready" instance on AWS

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
