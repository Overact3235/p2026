---
title: "Upgrading my VPS from Ubuntu 24.04 to 26.04"
description: "The steps, prompts and timings for an in-place upgrade to Ubuntu 26.04.1."
pubDate: 2026-11-03
tags: ["ubuntu", "vps", "self-hosting"]
draft: false
---

I upgraded my VPS from Ubuntu 24.04.5 to 26.04.1 LTS in place. Here are the steps I followed, the prompts the upgrader asks and what I answered, how long each part took, and what I checked afterwards. The upgrade itself took about 25 minutes of machine time. The preparation and the checks afterwards took longer, and they're the reason it went smoothly.

## What's on the box

- **Caddy** as the reverse proxy, from Caddy's own apt repo.
- **CrowdSec** with the iptables firewall bouncer, reading Caddy's access logs.
- **Tailscale** for private access.
- **Docker** running a small Compose stack: Uptime Kuma, n8n and a Minecraft server.
- A monitoring agent, vnStat for traffic accounting, and a couple of tools from a PPA and NodeSource.

That's a lot of software that doesn't come from Ubuntu, and that's where release upgrades usually go wrong.

## Step 1: Check the box matches your config

Before changing anything, make sure the server is actually in the state you think it is. Otherwise you can't tell afterwards whether something broke during the upgrade or was already broken.

I keep the server's config in a repo, so I compared the live files against it. The Caddyfile matched apart from `caddy fmt` whitespace. The CrowdSec acquisition file and custom scenarios were byte-identical to their templates.

## Step 2: Patch 24.04 fully

The upgrader wants a fully patched system. I ran my patch workflow, which pulled the last couple of updates (Docker Compose and Tailscale). By hand, it's:

```bash
sudo apt update && sudo apt full-upgrade
apt list --upgradable          # should print nothing
ls /var/run/reboot-required    # should not exist; reboot first if it does
```

## Step 3: Redeploy and confirm everything is healthy

I redeployed the Compose stack and waited until every container reported healthy in `docker ps`. If something breaks later, I want it to be the upgrade's fault, not something stale.

## Step 4: Take a snapshot

Take a snapshot at your VPS provider, or in Proxmox if it's a VM at home. That's the real rollback plan. If the upgrade goes badly, restore the snapshot instead of trying to repair a half-upgraded system.

## Step 5: Release package holds

I normally pin Docker with `apt-mark hold` so routine patching can't restart my containers. Holds can get in the way of a release upgrade, so release them first:

```bash
apt-mark showhold
sudo apt-mark unhold containerd.io docker-ce docker-ce-cli docker-buildx-plugin docker-compose-plugin
```

## Step 6: Start a logged tmux session

If your SSH connection drops halfway through the upgrade, you don't want it to take the upgrade down with it. Run it inside tmux, and log everything that appears on screen to a file:

```bash
tmux new -s up2604
tmux pipe-pane -o 'cat >> ~/up2604-$(date +%Y%m%d-%H%M).log'
```

Then check that the system is set to upgrade to LTS releases:

```bash
grep ^Prompt /etc/update-manager/release-upgrades   # Prompt=lts
```

## Step 7: Run the upgrade

```bash
sudo do-release-upgrade
```

The upgrader stops at every prompt and waits for you, however long that takes. Plan to stay at the terminal for the whole run.

### The prompts, in order

| # | Prompt | My answer | What to check |
|---|---|---|---|
| 1 | Release notes, "Continue" | `y` | |
| 2 | Foreign (third-party) packages installed | `y` | Mine were Caddy, CrowdSec, Node.js and two smaller tools. They stay at their current versions. |
| 3 | Summary: start the upgrade? | `y` | Press `d` for details first. Mine was 765 upgrades, 147 installs, 4 removals, 1.5 GB. Read the removal list. |
| 4 | Remove obsolete packages? | `y` | Press `d` again. Mine listed 67 packages, including Python 3.12, byobu and an old 6.8 kernel. |
| 5 | Restart required | reboot | If you skip or interrupt it, run `sudo reboot` yourself. |

On prompt 3, my removal list was harmless: a keyring daemon, two renamed libraries and a PackageKit tool.

On prompt 4, I expected the upgrader to also offer my third-party packages, since their repos were now disabled. It didn't. It only offers packages that were installed automatically as dependencies, and I'd installed Docker, Caddy, CrowdSec and Tailscale explicitly. Check with `d` anyway.

I got no config-file prompts at all. The upgrader replaced `/etc/default/grub` without asking. My provider's cloud-image GRUB settings live in a drop-in under `/etc/default/grub.d/`, so they survived.

### How long each part took

| Phase | Time |
|---|---|
| Calculating the changes, before the summary prompt | about 2 min |
| Download (1.5 GB) | under 3 min |
| Unpacking packages | about 10 min |
| Configuring packages, then rebuilding initramfs and GRUB | about 8 min |
| Obsolete package removal | 40 s |
| Reboot until SSH answers | about 1 min |

That's the machine time. Add however long you spend reading the `d` lists at each prompt.

### Two small mistakes

At the restart prompt, I hit Ctrl-C instead of answering. That's harmless: the upgrade was already finished, so I just ran `sudo reboot`.

Then, before rebooting, an up-arrow through my shell history started `do-release-upgrade` a second time. I caught it and aborted it, and it changed nothing. Still, check the command before you press Enter.

## Step 8: Check, don't assume

After the reboot, I went down a checklist:

```bash
uname -r                                     # 7.0.0-42-generic
systemctl is-enabled ssh.socket ssh.service  # disabled / enabled
sudo sshd -T | grep -E '^(port|permitrootlogin|passwordauthentication) '
sudo ufw status
systemctl is-active caddy crowdsec crowdsec-firewall-bouncer tailscaled docker
sudo docker ps
sudo visudo -c
```

The `ssh.socket` line matters on Ubuntu. Socket activation ignores a custom SSH port, so I keep it disabled, and I wanted proof that the upgrade hadn't turned it back on. It hadn't.

Every service and container came back on its own.

### What changed

- **Kernel** 6.8.0-147 → 7.0.0-42, with the 6.8 kernel kept in GRUB as a fallback.
- **OpenSSH** 9.6p1 → 10.2p1. My hardening drop-ins carried over untouched.
- **`sudo` is now `sudo-rs` 0.2.13**, the Rust rewrite. `visudo -c` parses my CI user's restricted rules, and `sudo -l` lists them correctly. A real CI deploy is the proper test, and that's still to do.
- **Rust coreutils** are the default, with GNU coreutils installed alongside.
- **Python 3.14**, apt 3.2, bash 5.3.

## Step 9: Re-enable third-party repos

The upgrader disables every third-party apt repo. My old one-line `.list` files couldn't be migrated to apt's newer deb822 format, so they were renamed to `*.list.disabled`. Before re-enabling anything, I checked which vendors actually publish a 26.04 (`resolute`) suite:

| Repo | On 26.04 |
|---|---|
| Caddy, NodeSource, the monitoring agent | Suite isn't tied to an Ubuntu release, so no change |
| CrowdSec | No `resolute` suite yet, but its release-agnostic `any` repo works |
| Docker, Tailscale, the fastfetch PPA | Only publish per-release suites, so switch to `resolute` |

The repos that didn't need touching all had one thing in common: their suite isn't named after an Ubuntu release. So that's my rule from now on. Where a vendor offers a release-agnostic suite, use it. Where it only publishes per-release suites, have the provisioning script read the release codename from the system when it writes the `.sources` file, instead of hard-coding it:

```bash
codename=$(. /etc/os-release && echo "$VERSION_CODENAME")   # resolute on 26.04
```

Then the next release upgrade means re-enabling the release-agnostic repos and re-running the script for the rest, not hand-editing files.

CrowdSec has a trap. Packagecloud's generic setup script writes a `resolute` suite that doesn't exist, which breaks `apt update`. CrowdSec's own installer writes the release-agnostic `any` repo, which carries the same build. Before trusting a 24.04 build on 26.04, I ran `ldd` on the binaries. CrowdSec, its bouncer and Caddy are all static binaries, so a library change can't break them.

I rewrote every repo as a deb822 `.sources` file. Then `apt upgrade` swapped Docker and containerd from their 24.04 builds to the 26.04 builds of the same versions. That restarts the Docker daemon, and the containers were healthy again inside two minutes.

## Still to do

- Run my CI deploy against the upgraded box to prove the sudo rules under `sudo-rs`.
- After a few days on kernel 7.0: `apt autoremove`, then delete the snapshot.
- Fix my provisioning script to follow the repo rule above. It still hard-codes an old Ubuntu codename for one repo and uses packagecloud's generic script for CrowdSec.

Next is my home server: same steps, on staging first.
