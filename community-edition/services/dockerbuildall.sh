#!/bin/bash

set -e

docker_username="${DOCKER_HUB_USERNAME:-hubsfoundation}"
docker_password="${DOCKER_HUB_PASSWORD}"
tagPrefix="${DOCKER_HUB_PREFIX:-hubsfoundation}"
platforms="${DOCKER_BUILD_PLATFORMS:-linux/amd64}"
tag="${DOCKER_HUB_TAG:-latest}"
containers="${DOCKER_CONTAINERS:=certbotbot coturn dialog haproxy hubs nearspark pgbouncer photomnemonic postgres postgrest reticulum speelycaptor spoke}"

########################
if ! [ -z $docker_username ]; then
    echo "docker login [$docker_username]"
    if ! [ -z $docker_username ]; then
      docker login --username $docker_username --password $docker_password
    else
      docker login --username $docker_username
    fi
    if [ -z $tagPrefix ]; then
      tagPrefix=$docker_username/
    else
      tagPrefix=${tagPrefix}/
    fi
fi

images=""
for dir in $containers ; do
    if [ -d "$dir" ]; then
        dir="${dir%/}"
        tag_name=$tagPrefix"${dir,,}:${tag}"
        msg="Building Docker image (-t $tag_name) for $dir"
        msg_len=${#msg}
        pad=$(printf '#%.0s' $(seq 1 $((msg_len + 8))))

        echo $pad; echo "### $msg ###"; echo $pad
        if [ "$dir" == "spoke" ]; then
          docker buildx build --tag "$tag_name" -f ./$dir/RetPageOriginDockerfile --platform ${platforms} --push ./$dir
        elif [ "$dir" == "hubs" ]; then
          docker buildx build --tag "$tag_name" -f ./$dir/RetPageOriginDockerfile --platform ${platforms} --push ./$dir
        else
          docker buildx build --tag "$tag_name" -f ./$dir/Dockerfile --platform ${platforms} --push ./$dir
        fi
        images=$images'\n'$tag_name
    fi
done

printf done:$images'\n'
