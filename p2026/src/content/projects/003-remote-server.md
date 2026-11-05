---
slug: "remote-server"
name: "Remote server"
description: "The VPS in front of everything: reverse proxy, intrusion detection and a few hosted apps."
date: 2025-12-19
status: "building"
stack: ["Ubuntu", "cloud-init", "Caddy", "CrowdSec", "Tailscale", "Docker"]
---

My remote server is a small VPS, and it's the public front door for everything I run.

It handles all the internet-facing work: Caddy as the reverse proxy, CrowdSec and UFW for protection, and Tailscale to reach my home lab privately. Public traffic for my home services lands on the VPS first, then travels to the home lab over the tailnet. The VPS also hosts a few apps of its own, including the [Minecraft server](/projects/mc-server), n8n and Uptime Kuma.

The whole server is built from a single cloud-init file in my infrastructure repo. Rebuilding it means pasting that file into a new order, with no hand-fixes afterwards. That's being put to the test this month, when the VPS gets replaced.

The posts below cover how it's set up, one piece at a time.
