# Introduction

This directory contains code and dockerfiles that can be used to recreate all services and dependencies that make up Hubs Community Edition for hosting in your own registry. This guide assumes that you have docker installed on your computer and that you have a docker registry account set up to receive the image builds of each codebase (we use [DockerHub](https://hub.docker.com/)).

### Fair Warning

Instead of using a git submodule, we have opted to centralize all codebases in `/services` for ease-of-use when just getting started. It is almost certain that these codebases **will drift from their sources of truth and become out-of-date**. Be sure to track down the latest versions of Hubs codebases to use with your build.

### Build Services

**Option A: Build All Services Locally In-Bulk and Deploy Later**

1. Run `bash dockerbuildall.sh` without specifying a docker_username. This will skip the log-in step.
2. Later, you can run `docker login {docker_username}` and `docker push {your_registry_url}:{tag_name}` to deploy each dependency.

**Option B: Build and Deploy All Services In-Bulk**

1. Populate `docker_username` in `dockerbuildall.sh`
2. Run `bash dockerbuildall.sh` and enter your docker registry password when prompted.

**Option C: Build and Deploy Services Individually**

1. Run `docker build -t {tag_name} -f ./{service_name}/Dockerfile ./{service_dir}` for your desired service.
2. Run `docker login {docker_username}` and enter your docker registry password when prompted.
3. Run `docker push {your_registry_url}:{tag_name}` for each service.

### Troubleshooting

- The `dockerbuildall.sh` was tested using bash4. There is a known issue with line 19 when using bash3. To fix, replace line 19 with `tag_name="${tagPrefix}$(echo "$dir" | tr '[:upper:]' '[:lower:]')"`
- For non-amd64 environments, you should add `--platform=linux/amd64` to `dockerbuildall.sh` line 26 to specify amd64.

### Use Services In Community Edition

When running [`render_hcce.sh`](../render_hcce.sh), you can specify your registry name and desired tag when running the script to populate your `hcce.yaml` file to point to your hosted images. To specify individual images or tags, edit specified images in `hcce.yaml`.

### Original Codebase Sources

**Mozilla-Authored Codebases**

- [Hubs](https://github.com/mozilla/hubs)
- [Spoke](https://github.com/mozilla/Spoke)
- [Reticulum](https://github.com/mozilla/reticulum)
- [Dialog](https://github.com/mozilla/dialog)

**Mozilla-Forked Codebases**

- [Nearspark](https://github.com/MozillaReality/nearspark)
- [Speelycaptor](https://github.com/mozilla/speelycaptor)
- [Photomnemonic](https://github.com/MozillaReality/photomnemonic)

**Other Codebases**

- [Certbotbot](./certbotbot/Dockerfile)
- [Coturn](./coturn/Dockerfile)
- [Postgres](./postgres/Dockerfile)
- [Postgrest](./postgrest/Dockerfile)
- [Haproxy](./haproxy/Dockerfile)
- [Pgbouncer](./pgbouncer/Dockerfile)
