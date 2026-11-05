---
slug: "home-lab"
name: "Home lab"
description: "The home server and the mini PCs around it: media, DNS, backups and testing."
date: 2025-02-04
status: "building"
stack: ["Docker", "Proxmox", "Jellyfin", "AdGuard Home", "Tailscale"]
---

My home lab started as one home theatre PC and grew from there.

The home server runs the household's media stack in Docker, with Jellyfin at its centre, plus local DNS through AdGuard Home and scheduled backups. Around it are a few mini PCs running Proxmox. Between them they run a fallback DNS server, a staging copy of the home server, and my coding agents in their own locked-down containers.

Public access to the home lab normally goes through my [remote server](/projects/remote-server) and reaches it over Tailscale.

The posts below cover how it's built and the decisions behind it.
