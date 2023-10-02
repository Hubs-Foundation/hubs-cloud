
# what this is
a free tool to deploying a hubs system on kubernetes
- enables anyone to host hubs on a variety of infrastructures, from closet server to public close and anything in between
- can be productionized with some modifications (read -- suggestions to make it production ready)
 
# what it is not 
a "turn key" solution for a production ready hubs system.
- flexibility/compatibility and production ready don't mix, it's not possible for one architectural design to simultaneously support average joe/jane's laptop and their company's production environment. 
- Designing, building, hosting, and maintaining production software systems goes beyond the scope of a single codebase. It encompasses both business aspects, such as budgeting and scoping, and engineering factors like security, reliability, scalability, and efficiency. Many books have been written on this subject.


# pre requisites
- kubernetes `hosting infrastrature`
- DNS service `to reach hubs services on a domain`
- ports: `exposed to the client`
    - tcp: 80,443,4443,5349
    - udp: 35000 - 60000
- smtp service `for login emails (optional)`

# deploy to kubernetes
`bash render_hcce.sh && kubectl apply -f `

# https certs
2 options
- bring your own
- use certbotbot


# example -- with vm on gcp
## make a kubernetes environment
### login gcp
gcloud auth login
### create a vm
### ssh to the vm
### install k3s with traefik disabled
- because we need port 80 and 443
## deploy to kubernetes (link to steps above)
## hook up the ingress for the vm
- dns
- firewall

# example -- with managed kubernetes on gcp
## make a kubernetes environment
### login gcp
gcloud auth login
### create gke cluster
gcloud container clusters create hcce-test-1 --zone=us-central1-a
### get creds for kubectl
gcloud container clusters get-credentials --region us-central1-a hcce-test-1
## deploy to kubernetes (link to steps above)
## hook up the ingress
- find the external ip with `kubectl -n hcce get svc lb`
- dns and firewall steps are the same <link to above>


# suggestions to make it production ready
- scalability
    - stateful services
        - pgsql 
            - use a managed pgsql ie. rds on aws or cloudsql on gcp
            - roll your own
                - <links to some guides to run pgsql in k8s>
        - reticulum
            - use a network/shared storage for reticulum's /storage mount
    - stateless services (all except reticulum and pgsql)
        - just run multiple replicas
        - use hpa
- security
    - password and keys
    - add a waf

