---
title: "Adding Minecraft to mc.p2026.xyz"
description: "I launched a Minecraft subdomain and added TCPShield to absorb volumetric garbage traffic."
pubDate: 2026-02-28
tags: ["minecraft", "networking", "security"]
project: "p2026"
---

I added a Minecraft server at `mc.p2026.xyz` and put TCPShield in front of it so the real server IP stays hidden. That was the whole goal: make it easy for friends to join, without exposing a raw game port directly to the internet.

The base setup is simple. Minecraft clients connect to `mc.p2026.xyz`, TCPShield receives that traffic, and TCPShield forwards clean traffic to my backend game host. In practice, this gives me one extra network layer between random internet noise and my actual box.

## What changed

I set up the DNS record to point the Minecraft hostname at the TCPShield endpoint, not my origin. Then I configured TCPShield to map that hostname to my real server address.

```txt
# DNS
mc.p2026.xyz  CNAME  <assigned-tcpshield-host>

# TCPShield mapping
Hostname: mc.p2026.xyz
Backend: <origin-ip>:25565
Proxy protocol: disabled (default)
```

From there, I restarted the server and tested from a clean client using only the hostname.

## Why the extra DDoS layer matters

Before this change, anyone who knew my origin IP and port could hit it directly. That means scanners, noisy bots, and random bursts all land on the same host that runs the game.

With TCPShield in front, direct origin details are no longer public by default. The hostname resolves to the proxy network, not the backend. That does not make the setup invincible, but it improves the baseline a lot for low-effort attacks and constant background probing.

For me, this is mostly about resilience and less about huge traffic events. Minecraft servers get weird connection spam even when they are small. Taking that junk off the origin path keeps performance more stable.

## Practical notes

- I kept this rollout minimal: hostname, proxy mapping, verify login path.
- I did not stack extra plugins or edge logic yet.
- I checked join latency after the switch; it was still acceptable for normal play.

Next step is deciding whether to keep this as a private server for friends or open it up a bit and add a proper status page for uptime and player count.
