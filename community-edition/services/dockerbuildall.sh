#!/bin/bash

set -e

docker_username="${DOCKER_HUB_USERNAME:-hubsfoundation}"
tagPrefix="${DOCKER_HUB_PREFIX:-dynamicdevices}"
platforms="${DOCKER_BUILD_PLATFORMS:-linux/amd64}"

########################
if ! [ -z $docker_username ]; then
    echo "docker login [$docker_username]"
    docker login --username $docker_username
    if [ -z $tagPrefix ]; then
      tagPrefix=$docker_username/
    else
      tagPrefix=${tagPrefix}/
    fi
fi

images=""
for dir in */ ; do
    if [ -d "$dir" ]; then
        dir="${dir%/}"
        tag_name=$tagPrefix"${dir,,}"
        msg="Building Docker image (-t $tag_name) for $dir"
        msg_len=${#msg}
        pad=$(printf '#%.0s' $(seq 1 $((msg_len + 8))))

        echo $pad; echo "### $msg ###"; echo $pad

        docker build -t "$tag_name" -f ./$dir/Dockerfile ./$dir --platform ${platforms}
        if ! [ -z $tagPrefix ]; then
            docker push $tag_name
        fi
        images=$images'\n'$tag_name
    fi
done

printf done:$images
