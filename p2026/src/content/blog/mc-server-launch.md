---
title: "Decisions Behind mc.p2026.xyz"
description: "How I designed a private Minecraft host for resilience, recoverability, and safer network exposure."
pubDate: 2026-02-28
tags: ["minecraft", "networking", "security"]
project: "p2026"
---

Starting a Minecraft server is easy now: pick a flavor, expose port `25565`, and call it done. The real challenge is running it in a way that is stable under normal chaos and not reckless from a security perspective. For `mc.p2026.xyz`, I treated this as an operations product, not a weekend experiment.

## Core hosting decisions

I made a few deliberate choices up front:

- **Container model:** use `itzg/minecraft-server` so configuration is declarative and repeatable.
- **Server flavor:** use **Paper** for better runtime behavior and plugin ecosystem support.
- **Version policy:** pin Minecraft version (`1.21.11`) to avoid surprise breakage from automatic updates.
- **Resource policy:** keep heap conservative (`2G` with `1G` initial) and cap container memory (`4G`) to protect the host. Averaging 5 users so this is more than enough headroom.

This was less about maximum performance and more about predictability. I wanted a server that behaves the same after restarts, updates, and operator mistakes.

## Why Paper and these plugins

Paper was a practical decision, not an ideological one. On this hardware profile, it gives better operational headroom than vanilla, especially once players spread out.

Plugin choices were intentionally narrow:

- **Chunky** for pre-generation, so world expansion does not hit players with generation spikes.
- **CoreProtect / Protocol tooling** for rollback visibility and network-side integration where needed.

The rule was simple: each plugin needs a clear operational or gameplay reason. I avoided plugin sprawl early because each addition increases upgrade and troubleshooting complexity.

## Backup and recovery strategy

I enabled native scheduled backups with a cron cadence of `0 */4 * * *` (every four hours) and retained the most recent recovery window (`SIMPLE_BACKUP_MAX_BACKUPS: "20"`).

That cadence was a deliberate tradeoff: frequent enough to limit rollback loss, but not so aggressive that backup activity creates unnecessary I/O pressure during normal play.

I also added a **weekly offline full backup** of the entire game directory. That serves a different purpose: disaster recovery when the live data path itself is corrupted or lost.

The important distinction is scope:

- Snapshot backups handle broad recovery.
- Block-level logging tools handle targeted rollback.
- Weekly offline full-directory backups cover catastrophic failure scenarios.

Storage is the hard constraint here. This VPS has only `50GB`, and Chunky pre-generation already adds several gigabytes to world data. Full backups are expensive, so retention has to stay conservative and intentional rather than unlimited.

That layered approach is more practical than expecting one mechanism to solve every failure mode.

## Monitoring, networking, and security boundary

I run uptime checks and service visibility through Uptime Kuma so I can catch availability regressions quickly instead of hearing about them from players first.

On networking, the visible endpoint is `mc.p2026.xyz`, but the security decision is the key point: the hostname resolves to **TCPShield**, not directly to the origin host. TCPShield forwards valid traffic to the backend server.

I also enforce whitelist-only access (`ENABLE_WHITELIST: "TRUE"`), so only approved players can join even if the address is shared. That keeps access control simple and lowers moderation overhead for a private server.

Operationally, I manage whitelist changes with `rcon-cli`, which lets me add or remove users without restarting the server.

That does not make the deployment immune to abuse. It does, however, materially improve the baseline by reducing direct origin exposure and absorbing routine garbage traffic that small game servers receive constantly.

Next step is deciding whether this remains a private friend server or grows into a lightly public instance with a simple status page and clearer operational SLOs.
