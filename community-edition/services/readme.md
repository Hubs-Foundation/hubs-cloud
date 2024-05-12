
# what is this dir
this dir contains codes and/or docker files that can be used to recreate all services/dependencies of hubs cloud community edition

# why not using git submodule for hubs/ret/etc.
because nobody knows if these codebases will keep existing in future

# how to build
- build locally ( to manually push it later):
  - `bash dockerbuildall.sh`
- build locally and push to dockerhub:
  - populate docker_username in dockerbuildall.sh
  - `bash dockerbuildall.sh`
