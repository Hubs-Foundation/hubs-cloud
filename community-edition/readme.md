

### pre requisites
- kubernetes `hosting infrastrature`
- DNS service `to reach into hubs services on a domain`
- smtp service `for login emails`
- reachable ports: 
    - tcp: 80,443,4443,5349
    - udp: 35000 - 60000
- 


### gcp
# login
gcloud auth login
# create gke cluster
gcloud container clusters create hcce-test-1 --zone=us-central1-a
# get creds for kubectl
gcloud container clusters get-credentials --region us-central1-a hcce-test-1
