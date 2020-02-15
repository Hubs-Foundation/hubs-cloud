#!/usr/bin/env bash

bio svc load -s at-once -u https://bldr.reticulum.io --channel polycosm-stable mozillareality/hubs-discord-bot
bio svc stop mozillareality/ita
sleep 3
bio svc start mozillareality/ita
