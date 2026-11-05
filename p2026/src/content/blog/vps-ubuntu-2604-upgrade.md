---
title: "Upgrading Ubuntu 24.04 to 26.04, step by step"
description: "The steps, prompts and timings for an in-place upgrade to Ubuntu 26.04.1."
pubDate: 2026-11-03
tags: ["ubuntu", "vps", "self-hosting"]
draft: false
---

This is how to upgrade a server from Ubuntu 24.04 LTS to 26.04.1 LTS in place: the preparation, the prompts the upgrader asks and what to answer, how long each part takes, and what to check afterwards. I followed these steps on my own VPS. The upgrade itself took about 25 minutes of machine time. Most of the work is the preparation and the checks afterwards.

The example numbers come from that VPS: 6 vCPU, about 12 GB of RAM, running Caddy, CrowdSec, Tailscale and a Docker Compose stack. That's a lot of software from outside Ubuntu, which is where release upgrades usually go wrong. Your package counts will differ, but the steps and prompts are the same.

## Before you start

### Step 1: Make sure the server is in a known state

Before changing anything, confirm the server is running the config you think it is. Otherwise, if something breaks, you can't tell whether the upgrade broke it or it was already broken.

If you keep your server config in a repo, compare the live files against it. Either way, note which services are running and healthy.

### Step 2: Patch 24.04 fully

The upgrader expects a fully patched system with no reboot pending:

```bash
sudo apt update && sudo apt full-upgrade
apt list --upgradable          # should print nothing
ls /var/run/reboot-required    # should not exist; reboot first if it does
```

### Step 3: Confirm your services are healthy

If you run containers, redeploy them and wait until every one reports healthy:

```bash
sudo docker ps
```

If something breaks later, you want to know it was the upgrade, not something stale.

### Step 4: Take a snapshot

Take a snapshot at your VPS provider, or in your hypervisor if it's a VM at home. This is your real rollback plan. If the upgrade goes badly, restore the snapshot instead of trying to repair a half-upgraded system.

### Step 5: Release package holds

If you've pinned packages with `apt-mark hold`, release them first, or they can get in the way of the upgrade. Docker is the common one:

```bash
apt-mark showhold
sudo apt-mark unhold containerd.io docker-ce docker-ce-cli docker-buildx-plugin docker-compose-plugin
```

### Step 6: Start a logged tmux session

If your SSH connection drops halfway through, you don't want it to take the upgrade down with it. Run the upgrade inside tmux, and log the session to a file:

```bash
tmux new -s up2604
tmux pipe-pane -o 'cat >> ~/up2604-$(date +%Y%m%d-%H%M).log'
```

Then check that the system is set to upgrade to LTS releases:

```bash
grep ^Prompt /etc/update-manager/release-upgrades   # Prompt=lts
```

## The upgrade

### Step 7: Run do-release-upgrade

```bash
sudo do-release-upgrade
```

The upgrader stops at every prompt and waits for you, however long that takes. Plan to stay at the terminal for the whole run.

### The prompts, in order

| # | Prompt | Answer | What to check |
|---|---|---|---|
| 1 | Release notes, "Continue" | `y` | |
| 2 | Foreign (third-party) packages installed | `y` | These are packages from outside Ubuntu, such as Caddy, CrowdSec or Node.js. They stay at their current versions. |
| 3 | Summary: start the upgrade? | `y` | Press `d` for details first and read the removal list. Mine was 765 upgrades, 147 installs, 4 removals and a 1.5 GB download. |
| 4 | Remove obsolete packages? | `y` | Press `d` again. Mine listed 67 packages, including Python 3.12, byobu and the old 6.8 kernel. |
| 5 | Restart required | reboot | If you skip it, run `sudo reboot` yourself. |

At prompt 3, the removal list should be small and boring. Mine was a keyring daemon, two renamed libraries and a PackageKit tool. If it lists something you rely on, stop and find out why.

At prompt 4, you might expect it to offer your third-party packages too, since their repos are now disabled. It doesn't. It only offers packages that were installed automatically as dependencies, not ones you installed yourself. Check with `d` anyway.

You may get no config-file prompts at all. I didn't. Note that the upgrader replaces `/etc/default/grub` without asking. If your provider's cloud image puts its GRUB settings in a drop-in under `/etc/default/grub.d/`, those survive.

### How long each part takes

| Phase | Time |
|---|---|
| Calculating the changes, before the summary prompt | about 2 min |
| Download (1.5 GB) | under 3 min |
| Unpacking packages | about 10 min |
| Configuring packages, then rebuilding initramfs and GRUB | about 8 min |
| Obsolete package removal | 40 s |
| Reboot until SSH answers | about 1 min |

That's the machine time on a 6 vCPU VPS. Add however long you spend reading the `d` lists at each prompt.

## After the reboot

### Step 8: Check, don't assume

Go down a checklist instead of assuming everything came back:

```bash
uname -r                                     # 7.0.0-42-generic or newer
systemctl is-enabled ssh.socket ssh.service
sudo sshd -T | grep -E '^(port|permitrootlogin|passwordauthentication) '
sudo ufw status
systemctl --failed
sudo docker ps
sudo visudo -c
```

Adjust the list to your own services. On mine, I also checked Caddy, CrowdSec, its firewall bouncer and Tailscale by name with `systemctl is-active`.

The `ssh.socket` line matters if you run SSH on a custom port. Socket activation ignores the custom port, so the usual fix is to disable `ssh.socket` and enable `ssh.service`. Check that the upgrade didn't turn the socket back on. Mine stayed disabled.

### What changes in 26.04

- **Kernel** 6.8 → 7.0, with the old kernel kept in GRUB as a fallback.
- **OpenSSH** 9.6p1 → 10.2p1. Hardening drop-ins in `sshd_config.d` carry over untouched.
- **`sudo` is now `sudo-rs`**, the Rust rewrite. If you have restricted sudo rules, such as for a CI user, check them with `visudo -c` and `sudo -l -U <user>`, then run a real job through them.
- **Rust coreutils** are the default, with GNU coreutils installed alongside.
- **Python 3.14**, apt 3.2, bash 5.3. Python 3.12 is removed.

### Step 9: Re-enable third-party repos

The upgrader disables every third-party apt repo. Old one-line `.list` files can't be migrated to apt's newer deb822 format, so they're renamed to `*.list.disabled`. Before re-enabling each one, check whether the vendor publishes a 26.04 (`resolute`) suite:

| Repo | On 26.04 |
|---|---|
| Caddy, NodeSource | Suite isn't tied to an Ubuntu release, so no change |
| CrowdSec | No `resolute` suite yet, but its release-agnostic `any` repo works |
| Docker, Tailscale | Only publish per-release suites, so switch to `resolute` |

The pattern: repos whose suite isn't named after an Ubuntu release don't need touching. So where a vendor offers a release-agnostic suite, use it. Where it only publishes per-release suites, don't hard-code the codename in your provisioning scripts. Read it from the system:

```bash
codename=$(. /etc/os-release && echo "$VERSION_CODENAME")   # resolute on 26.04
```

Then the next release upgrade means re-enabling repos and re-running a script, not hand-editing files.

CrowdSec has a trap. Packagecloud's generic setup script writes a `resolute` suite that doesn't exist, which breaks `apt update`. CrowdSec's own installer writes the release-agnostic `any` repo instead, which carries the same build. If you're keeping a 24.04 build of something on 26.04, run `ldd` on its binaries first. Static binaries, like CrowdSec's and Caddy's, can't be broken by a library change.

Write each repo as a deb822 `.sources` file, then run `sudo apt update && sudo apt upgrade`. On Docker, this swaps the 24.04 builds for the 26.04 builds of the same versions and restarts the daemon. My containers were healthy again inside two minutes.

### Step 10: Clean up after a few days

Once the server has run on the new kernel for a few days without problems:

```bash
sudo apt autoremove
```

Then put back any package holds you released in step 5, and delete the snapshot.
