#!/usr/bin/env bash

bio svc key generate hubs-discord-bot.default $(cat /var/lib/polycosm/stack_name || echo "polycosm")
chmod 440 /hab/cache/keys/hubs-discord-bot*
chown root:hab /hab/cache/keys/hubs-discord-bot*
bio svc load -s at-once -u https://bldr.reticulum.io --channel polycosm-stable mozillareality/hubs-discord-bot
bio svc stop mozillareality/ita
sleep 3
bio svc start mozillareality/ita
