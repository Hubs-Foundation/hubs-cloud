pkg_name=janus-gateway
pkg_origin=mozillareality
pkg_maintainer="Mozilla Mixed Reality <mixreality@mozilla.com>"
pkg_version="2.0.1"
pkg_description="A simple mediasoup based SFU"

pkg_deps=(
  core/node/18
  mozillareality/gcc-libs
  mozillareality/openssl
)

pkg_build_deps=(
  core/git
  mozillareality/gcc
  core/make
  core/patchelf
)

do_build() {
  CFLAGS="${CFLAGS} -O2 -g" CPPFLAGS="${CPPFLAGS} -O2 -g" CXXFLAGS="${CXXFLAGS} -O2 -g" npm ci
  patchelf --set-rpath "$(pkg_path_for gcc-libs)/lib" node_modules/mediasoup/worker/out/Release/mediasoup-worker
  pushd node_modules
  rm -rf mediasoup/worker/deps
  rm -rf mediasoup/worker/out/Release/obj.target
  rm -rf clang-tools-prebuilt
  rm -rf eslint
  rm -rf prettier
  popd
}

do_install() {
  cp -r ./*.js ./*.json ./lib ./node_modules "${pkg_prefix}/"
  rm -rf node_modules/mediasoup
}

do_strip() {
  return 0;
}
