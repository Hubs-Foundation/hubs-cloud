set -m 
healthcheck(){
    while true; do (echo -e 'HTTP/1.1 200 OK\r\n\r\n 1') | nc -lp 1111 > /dev/null; done
}

healthcheck &

echo "PSQL::4=${PSQL::4}" 
echo "REALM=$REALM" 
export internalIp="$(ip a | grep -Eo "inet (addr:)?([0-9]*\.){3}[0-9]*" | grep -Eo "([0-9]*\.){3}[0-9]*" | grep -v "127.0.0.1" | head -1)" 
echo "internalIp: $internalIp" 
export externalIp="$(curl https://ipinfo.io/ip)" 
echo "externalIp: $externalIp" 
echo "realm=$REALM" > /etc/turnserver.conf 
echo "no-udp=true" >> /etc/turnserver.conf 
echo "no-tcp=true" >> /etc/turnserver.conf 
echo "no-dtls=false" >> /etc/turnserver.conf 
echo "no-tls=false" >> /etc/turnserver.conf 
echo "no-auth-pings=true" >> /etc/turnserver.conf 
echo "no-dynamic-ip-list=true" >> /etc/turnserver.conf 
echo "no-dynamic-realms=true" >> /etc/turnserver.conf 
echo "min-port=49152" >> /etc/turnserver.conf 
echo "max-port=51609" >> /etc/turnserver.conf 
echo "tls-listening-port=5349" >> /etc/turnserver.conf 
echo "###psql-schema=coturn" >> /etc/turnserver.conf 
echo "use-auth-secret=true" >> /etc/turnserver.conf 
echo "cert=/certs/cert.pem" >> /etc/turnserver.conf 
echo "pkey=/certs/key.pem" >> /etc/turnserver.conf 
echo "listening-ip=$internalIp" >> /etc/turnserver.conf 
echo "relay-ip=$internalIp" >> /etc/turnserver.conf 
echo "external-ip=$externalIp" >> /etc/turnserver.conf 
cat /etc/turnserver.conf 
echo "####################################################" 
turnserver --log-file=stdout --lt-cred-mech --psql-userdb=$PSQL
