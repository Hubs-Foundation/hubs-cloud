#!/bin/bash

set -e

docker_username=""

########################
tagPrefix=""
if ! [ -z $docker_username ]; then
    echo "docker login [$docker_username]"
    docker login --username $docker_username
    tagPrefix=$docker_username/
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

        docker build -t "$tag_name" -f ./$dir/Dockerfile ./$dir
        if ! [ -z $tagPrefix ]; then
            docker push $tag_name
        fi
        images=$images'\n'$tag_name
    fi
done

printf done:$images
