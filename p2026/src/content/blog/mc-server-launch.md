---
title: "Adding Minecraft to mc.p2026.xyz"
description: "I launched a Minecraft subdomain and added TCPShield to absorb volumetric garbage traffic."
pubDate: 2026-02-28
tags: ["minecraft", "networking", "security"]
project: "p2026"
---

I added a Minecraft server at `mc.p2026.xyz` and put TCPShield in front of it so the real server IP stays hidden. That was the whole goal: make it easy for friends to join, without exposing a raw game port directly to the internet.

This deployment had two priorities: preserve ease of access and reduce direct exposure of the host. Players connect to `mc.p2026.xyz`, TCPShield terminates inbound game traffic, and only proxied traffic is forwarded to the backend server. In operational terms, that introduces a controlled network boundary between public traffic and the origin.

## What changed

I made two infrastructure changes:

- DNS now points the Minecraft hostname to the TCPShield endpoint rather than the origin.
- TCPShield maps that hostname to the backend game server on port `25565`.

```txt
# DNS
mc.p2026.xyz  CNAME  <assigned-tcpshield-host>

# TCPShield mapping
Hostname: mc.p2026.xyz
Backend: <origin-ip>:25565
Proxy protocol: disabled (default)
```

After applying those changes, I restarted the service and validated connectivity from a clean client using only the hostname.

## Why the extra DDoS layer matters

Before this setup, anyone with the origin IP and open port could target the host directly. In practice, that puts routine scanning and bursty connection noise on the same machine responsible for gameplay.

With TCPShield in front, the public hostname resolves to the proxy layer instead of the backend. This does not eliminate risk, but it significantly improves the baseline against low-effort disruption and continuous background probing.

For this project, the objective is resilience rather than large-scale traffic absorption. Even small Minecraft servers attract irregular connection behavior; offloading that noise from the origin path improves stability and keeps troubleshooting simpler.

## Practical notes

- Scope remained intentionally narrow: hostname, proxy mapping, and connection validation.
- I avoided additional edge plugins during the initial rollout to keep failure modes limited.
- Post-change latency remained acceptable for normal play sessions.

Next decision: keep this instance private for friends, or open access and add a basic public status page for uptime and player count.
