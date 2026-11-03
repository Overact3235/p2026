---
title: "Upgrading my VPS from Ubuntu 24.04 to 26.04"
description: "How I checked, upgraded and re-verified a VPS on Ubuntu 26.04.1."
pubDate: 2026-11-03
tags: ["ubuntu", "vps", "self-hosting"]
draft: true
---

I moved my VPS from Ubuntu 24.04.5 to 26.04.1 LTS in place. The upgrade itself took about 26 minutes of machine time. Most of the effort went into checking things before and after, and that's the part worth writing down.

## What's on the box

- **Caddy** as the reverse proxy, from Caddy's own apt repo.
- **CrowdSec** with the iptables firewall bouncer, reading Caddy's access logs.
- **Tailscale** for private access.
- **Docker** running a small Compose stack: Uptime Kuma, n8n and a Minecraft server.
- A monitoring agent, vnStat for traffic accounting, and a couple of tools from a PPA and NodeSource.

So: a lot of software that doesn't come from Ubuntu. That's where release upgrades go wrong.

## Before: prove the current state

I didn't want to find out after the upgrade that the box had already drifted from my repo. So first I compared the live config against the repo: the Caddyfile matched apart from `caddy fmt` whitespace, and the CrowdSec acquisition and custom scenarios were byte-identical to their templates.

Then:

1. **Patch 24.04 fully.** My patch workflow pulled the last couple of updates (Docker Compose and Tailscale). After that, nothing upgradable and no reboot pending.
2. **Redeploy the Compose stack** and wait for every container to report healthy, so any later breakage would be the upgrade's fault, not something stale.
3. **Take a snapshot** at the provider. That's the real rollback plan.
4. **Release the Docker holds.** I normally pin Docker with `apt-mark hold` so routine patching can't restart my containers.
5. **Start a logged tmux session**, so a dropped SSH connection can't kill the upgrade halfway:

```bash
tmux new -s up2604
tmux pipe-pane -o 'cat >> ~/up2604-$(date +%Y%m%d-%H%M).log'
grep ^Prompt /etc/update-manager/release-upgrades   # Prompt=lts
apt list --upgradable                                # empty
sudo do-release-upgrade
```

## During: read every list

The upgrader planned 765 upgrades, 147 installs and 4 removals, a 1.5 GB download. It also warned about "foreign packages": Caddy, CrowdSec and Node.js, which stay at their current versions.

At each prompt I pressed `d` and read the details before answering. The removal list was harmless: a keyring daemon, two renamed libraries and a PackageKit tool. Near the end, "Remove obsolete packages?" offered 67 packages, including Python 3.12, byobu and an older 6.8 kernel. I'd assumed it would also offer my third-party packages, because their repos were now disabled. It didn't. It only offers packages that were pulled in automatically, and I'd installed the stack explicitly.

| Phase | Time |
|---|---|
| Download | under 3 min |
| Unpack and configure | about 19 min |
| Obsolete removal | 40 s |
| Reboot to SSH | about 1 min |

## After: check, don't assume

After the reboot I went down a checklist:

```bash
uname -r                                     # 7.0.0-42-generic
systemctl is-enabled ssh.socket ssh.service  # disabled / enabled
sudo sshd -T | grep -E '^(port|permitrootlogin|passwordauthentication) '
sudo ufw status
systemctl is-active caddy crowdsec crowdsec-firewall-bouncer tailscaled docker
sudo docker ps
sudo visudo -c
```

The `ssh.socket` line matters on Ubuntu. Socket activation ignores a custom SSH port, so I keep it disabled, and I wanted proof the upgrade hadn't brought it back. It hadn't.

What changed:

- **Kernel** 6.8.0-147 → 7.0.0-42, with the 6.8 kernel kept in GRUB as a fallback.
- **OpenSSH** 9.6p1 → 10.2p1. My hardening drop-ins carried over untouched.
- **`sudo` is now `sudo-rs` 0.2.13**, the Rust rewrite. `visudo -c` parses my CI user's restricted rules, and `sudo -l` lists them correctly. A real CI deploy is the actual test, and that's still to do.
- **Rust coreutils** are the default, with GNU coreutils installed alongside.
- **Python 3.14**, apt 3.2, bash 5.3.

Every service and container came back on its own.

## The one real cleanup: third-party repos

The upgrader disabled every third-party apt repo. My old one-line `.list` files couldn't be migrated to apt's deb822 format, so they were renamed to `*.list.disabled`. Before re-enabling anything, I checked which vendors actually publish a 26.04 (`resolute`) suite:

| Repo | On 26.04 |
|---|---|
| Caddy, NodeSource, the monitoring agent | suite isn't tied to a release, no change |
| CrowdSec | no `resolute` yet, but its release-agnostic `any` repo works |
| Docker, Tailscale, the fastfetch PPA | only publish per-release suites, so switch to `resolute` |

The repos that didn't need touching all had one thing in common: their suite isn't named after an Ubuntu release. So that's my rule from now on. Where a vendor offers a release-agnostic suite, use it. Where it only publishes per-release suites, have the provisioning script read the codename from the system when it writes the `.sources` file, instead of hard-coding it:

```bash
codename=$(. /etc/os-release && echo "$VERSION_CODENAME")   # resolute on 26.04
```

Then the next release upgrade means re-enabling the release-agnostic repos and re-running the script for the rest, not hand-editing files.

CrowdSec has a trap. Packagecloud's generic setup script writes a `resolute` suite that doesn't exist, which breaks `apt update`. CrowdSec's own installer writes the release-agnostic `any` repo, which carries the same build. Before trusting a 24.04 build on 26.04, I ran `ldd` on the binaries: CrowdSec, its bouncer and Caddy are all static, so a library change can't break them.

I rewrote every repo as a deb822 `.sources` file. Then `apt upgrade` swapped Docker and containerd from their 24.04 builds to the 26.04 builds of the same versions. That restarts the Docker daemon. The containers were healthy again inside two minutes.

## Still to do

- Run my CI deploy against the upgraded box to prove the sudo rules under `sudo-rs`.
- After a few days on kernel 7.0: `apt autoremove`, then drop the snapshot.
- Fix my provisioning script to follow that rule. It still hard-codes an old Ubuntu codename for one repo and uses packagecloud's generic script for CrowdSec.

Next is my home server, same checklist, with staging first.
