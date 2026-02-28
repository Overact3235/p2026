---
title: "Hosting a Minecraft server"
description: "How I designed a private Minecraft host for resilience, recoverability, and safer network exposure."
pubDate: 2026-02-28
tags: ["minecraft", "networking", "security"]
project: "p2026"
---

Starting a Minecraft server is easy now: pick a flavor, expose port `25565`, and run it. The hard part is operating it safely. For `mc.p2026.xyz`, the objective was a private server that is predictable, recoverable, and harder to abuse.

## Core hosting decisions

I made a few decisions early and kept them explicit:

- **Container model:** use `itzg/minecraft-server` so configuration is declarative and repeatable.
- **Server flavor:** use **Paper** for better runtime behavior and plugin support.
- **Version policy:** pin Minecraft version (`1.21.11`) to avoid surprise breakage from automatic updates.
- **Resource policy:** keep heap conservative (`2G` with `1G` initial) and cap container memory (`4G`). Average load is around five players, so this leaves enough headroom.

The theme is consistency over peak throughput. I want the server to behave the same after restarts, updates, and mistakes.

## Why Paper and these plugins

Paper was a practical choice. On this hardware profile, it gives better operational headroom than vanilla once players spread out.

Plugin scope stayed narrow:

- **Chunky** for pre-generation, so world expansion does not hit players with generation spikes.
- **CoreProtect / Protocol tooling** for rollback visibility and network-side integration where needed.

Rule: every plugin needs a clear operational or gameplay reason. Avoiding plugin sprawl keeps upgrades and troubleshooting manageable.

## Backup and recovery strategy

I enabled native scheduled backups with `0 */4 * * *` (every four hours) and kept retention at `SIMPLE_BACKUP_MAX_BACKUPS: "20"`.

That cadence is a tradeoff: frequent enough to limit rollback loss, not so frequent that backup I/O becomes a gameplay issue.

I also added a **weekly offline full backup** of the entire game directory. That serves a different purpose: disaster recovery when the live data path itself is corrupted or lost.

The important distinction is scope:

- Snapshot backups handle broad recovery.
- Block-level logging tools handle targeted rollback.
- Weekly offline full-directory backups cover catastrophic failure scenarios.

Storage is the hard constraint. This VPS has only `50GB`, and Chunky pre-generation adds multiple gigabytes to world data. Full backups are expensive, so retention has to stay conservative.

This layered model is more realistic than expecting one backup mechanism to solve everything.

## Monitoring, networking, and security boundary

I use Uptime Kuma to catch availability regressions before players report them.

On networking, `mc.p2026.xyz` resolves to **TCPShield**, not directly to the origin host. TCPShield then forwards valid traffic to the backend.

I also enforce whitelist-only access (`ENABLE_WHITELIST: "TRUE"`), so only approved players can join even if the address is shared. That keeps access control simple and lowers moderation overhead for a private server.

Operationally, I manage whitelist changes with `rcon-cli`, which lets me add or remove users without restarting the server.

This setup is not immune to abuse, but it materially improves the baseline by reducing direct-origin exposure and absorbing routine garbage traffic.

Next decision: keep this as a private friend server, or open it up and add a public status page with clearer operating targets.

## References

- [itzg/minecraft-server Docker image](https://github.com/itzg/docker-minecraft-server)
- [TCPShield](https://tcpshield.com/)
- [my resources page](https://p2026.xyz/resources)
