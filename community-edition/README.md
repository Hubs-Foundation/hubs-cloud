# Hubs Community Edition 

 hubs community edition is a Kubernetes-based version of the hubs cloud. This allows for breaking many features into micro-services which allows for flexibility and availability


## High-Level Overview.
Our code runs within Kubernetes Pods 
The pod + Kubernetes Storage option you pick will host your data
Ingress-controller pods to route our traffic.

Everything is stateless, but the blob storage needs a stateful storage solution. 


## Infrastructure requirements
Kubernetes Cluster on any cloud provider 
Ingress controller for routing traffic 
Postgres Database. 
NFS Filesystem 