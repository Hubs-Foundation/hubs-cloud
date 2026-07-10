from coturn/coturn:alpine
user root:root
run apk add curl openssl netcat-openbsd
copy entrypoint.sh /entrypoint.sh
run chmod +x /entrypoint.sh
volume ["/var/lib/coturn"]
cmd /entrypoint.sh
