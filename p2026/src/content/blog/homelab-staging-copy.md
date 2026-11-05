---
title: "A staging copy of my home media server"
description: "Copying production into a test VM, and the rules that keep it harmless."
pubDate: 2026-11-05
tags: ["homelab", "proxmox", "docker"]
draft: true
---

Until last month, my home media server had one environment: production. Every container update, compose change and script fix ran for the first time on the box my household was watching TV on. A Caddy release with breaking changes and a backup script failure both showed up in production first. A Jellyfin major version, with database migrations, was next in the queue, and I didn't want to meet that one live.

So I built a staging copy. The interesting part wasn't building it. It was working out all the ways a "harmless" test copy could damage the real thing.

## The shape

Staging is a VM on a separate mini PC running Proxmox. A VM rather than an LXC container, for three reasons: Docker inside an unprivileged LXC needs extra permissions I'd already decided against, an unprivileged LXC can't mount my NAS over SMB, and a VM runs the same OS and kernel as the real server. That last one matters. Building staging from the repo doubles as a rehearsal for rebuilding production after a disaster.

It uses the same host paths as production, so the real compose files run unchanged. The only differences live in two small override files.

## Copy everything, then sanitize

I chose to make staging an exact copy of production's app configs. That way, the only intended difference is the branch I'm testing. But a copy can't run as-is without acting on production's accounts. So one fixed script, `staging_sanitize.sh`, runs after every copy and before the clean snapshot. It does the same thing on every rebuild. It's part of the environment, not something I tweak per test.

Some of what it changes:

- **Jellyfin hardware transcoding off.** Production uses the Intel GPU. The staging host doesn't have one.
- **Uptime Kuma notifications detached.** The copied monitors fail on staging, because some services don't run there. Without this, staging would page my real alert channels.
- **Indexers and subtitle providers off.** Otherwise staging would search using production's accounts and burn through its daily quotas.
- **VPN pointed at a different country.** Both environments share one VPN key, and two clients on the same server knock each other off.

## The rules

These are the part of the plan that matters most. Each one is a way staging could quietly break production.

1. **Staging never writes production media.** It mounts a single NAS folder, read-only twice: the NAS account is read-only on that share, and the mount itself is `ro`. Sonarr, Radarr and Bazarr all rename, delete or write files. Pointed at the real library with write access, any of them would change it.
2. **No download client state and no indexer keys.** A copied client would announce the same downloads from a second IP. That's how accounts get flagged.
3. **No Cloudflare Tunnel token.** I hadn't thought about this one until I wrote it down. A second `cloudflared` with the same token registers as another connector of the same tunnel, and Cloudflare sends real public traffic to it.
4. **No secrets-manager token.** On the free tier my only machine account is production's, and its token can read every secret. Staging gets the four secrets it needs in a `0600` file and nothing else.
5. **Not on my tailnet, and not in scheduled backups.** Its recovery method is a snapshot, not a backup.

The deploy script enforces the split too. It refuses staging settings on a host without the staging marker, and refuses production settings on a host that has one.

## Snapshots instead of backups

The VM is built in layers, each one snapshotted: `base`, `repo-env`, `app-sanitized`, then `clean`. Testing a branch means deploying it, breaking whatever I like, and rolling back to `clean` in seconds. Nothing on staging is worth keeping, so nothing gets backed up.

Staging also leads production on host updates. It took a newer Docker first, and that's deliberate. If staging had to match production version for version, it could only ever test the past.

## Did it pay off?

Already, yes. The first build on 18 October found gaps in my runbook. Restored backups lose file ownership, so every app folder needed a `chown`. The VM needed a registry login to pull my images. It needed two compose overrides I hadn't planned for. All of that would have bitten me during a real rebuild of production, at the worst possible time.

It idles at about 10 W, running 19 containers. Next up is the Jellyfin major version, on staging first this time.
