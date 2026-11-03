---
title: "Upgrading my VPS from Ubuntu 24.04 to 26.04"
description: "What an in-place Ubuntu 24.04 to 26.04.1 upgrade changed, and what it broke."
pubDate: 2026-11-03
tags: ["ubuntu", "vps", "self-hosting"]
draft: true
---

I moved my VPS from Ubuntu 24.04 to 26.04.1 LTS in place. The machine did about 25 minutes of work. I spent 72 minutes at the keyboard, and roughly 35 of those were the upgrader waiting for me to answer a question.

## Why 26.04, and why now

I'd already decided to keep my servers on Ubuntu LTS rather than move them to Debian. My provisioning scripts assume Ubuntu, and 24.04 gets free security updates until 2029, so there was no rush. The rule I set was to wait for the first point release, 26.04.1, which usually means the worst launch bugs are fixed.

## The prep

- A full snapshot from the VPS provider, so there's a way back if it goes wrong.
- 24.04 fully patched first, with nothing left in `apt list --upgradable` and no pending reboot.
- A `tmux` session logging everything to a file, so a dropped SSH connection can't kill the upgrade halfway.
- Docker packages released from `apt-mark hold`, so the upgrader is allowed to touch them.

Then:

```bash
sudo do-release-upgrade
```

## The run

The upgrader warned about "foreign packages" (Caddy, CrowdSec, Node.js and a couple of others from outside Ubuntu's repos) and said they'd stay at their current versions. Then it planned 765 upgrades, 147 installs and 4 removals: a 1.5 GB download.

The timing broke down like this:

- **Download:** under 3 minutes.
- **Unpack and configure:** about 18 minutes.
- **Removing obsolete packages:** 40 seconds.
- **Reboot:** about a minute.

The other 35 minutes went on two prompts I wasn't watching: "Remove obsolete packages?" and "Restart required". The upgrader stops and waits at every one, so **stay at the terminal until it finishes**.

One self-inflicted moment: I pressed up-arrow and Enter at the wrong time and started `do-release-upgrade` a second time. I aborted it straight away, and it hadn't changed anything.

## What changed

- **Kernel** 6.8 → 7.0. The old kernel stays as a fallback in GRUB.
- **OpenSSH** 9.6 → 10.2. My `sshd_config.d` hardening (custom port, no root login, no passwords) carried over untouched.
- **`sudo` is now `sudo-rs`**, the Rust rewrite. `visudo -c` still parses my sudoers rules. I haven't proven them under a real CI run yet.
- **Rust coreutils are the default.** GNU coreutils is still installed alongside.
- **Python 3.14** replaced 3.12. Also new: apt 3.2 and bash 5.3.

No config-file prompts appeared, and every service came back on its own after the reboot.

## What broke: third-party repos

The upgrader **disabled every third-party apt repo**: Docker, Caddy, CrowdSec, Tailscale and the rest. My old `.list` files couldn't be migrated to apt's newer deb822 format, so they were renamed to `*.list.disabled`.

Re-enabling them wasn't one-size-fits-all:

| Repo | What to use on 26.04 |
|---|---|
| Docker, Tailscale | Switch the suite to `resolute` |
| Caddy | No change, its suite isn't tied to a release |
| CrowdSec | No `resolute` suite yet, but its release-agnostic `any/any` repo has the same builds |

CrowdSec has one trap. The generic packagecloud setup script writes a `resolute` suite that doesn't exist, which breaks `apt update`. CrowdSec's own installer writes the `any/any` repo instead, and that one works.

I rewrote them all as deb822 `.sources` files. apt 3 still reads the old `.list` format, but the next release upgrade will only migrate deb822.

Once the repos were back, `apt upgrade` swapped Docker from its 24.04 build to the 26.04 build of the same version. The containers restarted and were healthy again within about two minutes.

## Still to do

- Run my CI deploy against the upgraded host, to prove the sudo rules hold under `sudo-rs`.
- After a day on 7.0, run `apt autoremove`, clear out the old kernel, and drop the snapshot.
- Fix my provisioning script, which still hard-codes an older Ubuntu codename for the Tailscale repo.

Next is my home server. Same steps, but this time on staging first.
