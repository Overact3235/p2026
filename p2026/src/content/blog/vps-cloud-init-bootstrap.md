---
title: "Bootstrapping a VPS with cloud-init"
description: "One file that turns a fresh VPS into a hardened, ready server on first boot."
pubDate: 2026-11-05
tags: ["vps", "cloud-init", "self-hosting"]
draft: false
---

When I order a VPS, I paste one file into the provider's control panel. By the time I first log in, the server has my user, hardened SSH, its packages, a reverse proxy, intrusion detection and a firewall. That file is a cloud-init config. This post covers how to build one, step by step.

This is the first post in a series on how my VPS is set up. The later posts cover each piece in more detail.

## Why cloud-init

Cloud-init runs once, on the server's first boot, before you ever log in. Most VPS providers support it, often as a "user data" or "cloud-init" box when you order. It needs nothing installed on your laptop and nothing extra on the server.

What sold me on it was rebuilding. Setting a server up by hand works until you have to do it again and can't remember what you did. With cloud-init, the setup lives in a file in my repo, and rebuilding means pasting that file into a new order. My goal is to rebuild the VPS from that file with no hand-fixes afterwards.

Mine started at about 40 lines: a user, SSH settings and a firewall. It grew every time I installed something by hand and then moved it into the file.

## The shape of the file

A cloud-init config is YAML, and the first line must be exactly `#cloud-config`. If the first line is anything else, cloud-init won't treat the file as config.

```yaml
#cloud-config
package_update: true      # 1. update and upgrade
package_upgrade: true

users: []                 # 2. your user
packages: []              # 3. packages from Ubuntu
write_files: []           # 4. config files
runcmd: []                # 5. commands, run in order
```

Cloud-init writes the files before it runs the commands, so `runcmd` can rely on them being there.

## Step 1: Create your user

Log in as your own user with a key, never as root with a password:

```yaml
users:
  - name: youruser
    shell: /bin/bash
    groups: sudo, users
    sudo: ALL=(ALL) NOPASSWD:ALL
    lock_passwd: true
```

`lock_passwd: true` means the user has no password at all, so key-based SSH is the only way in. Most providers put the SSH key you chose when ordering on the root account. You'll copy it to your user in step 4.

## Step 2: Install packages

List what you want from Ubuntu's own repos:

```yaml
packages:
  - ufw
  - curl
  - git
  - unattended-upgrades
```

Keep this list for Ubuntu packages only. Software from vendor repos goes in `runcmd` (step 5). Core utilities get their own post in this series.

## Step 3: Write the SSH config as a drop-in

Don't edit `/etc/ssh/sshd_config` in place. Write a separate file into `sshd_config.d/`:

```yaml
write_files:
  - path: /etc/ssh/sshd_config.d/99-custom.conf
    permissions: '0644'
    content: |
      Port 2222
      PermitRootLogin no
      PasswordAuthentication no
      MaxAuthTries 5
      MaxSessions 3
      LoginGraceTime 60s
```

Pick your own port. A non-standard port doesn't stop a determined attacker, but it removes most of the automated noise from your logs.

## Step 4: Apply the SSH settings in runcmd

```yaml
runcmd:
  # Ubuntu 24.04: run sshd directly instead of through the systemd socket
  - systemctl disable --now ssh.socket
  - systemctl enable --now ssh.service

  # Copy the provider's key from root to your user
  - mkdir -p /home/youruser/.ssh
  - cp /root/.ssh/authorized_keys /home/youruser/.ssh/authorized_keys
  - chown -R youruser:youruser /home/youruser/.ssh
  - chmod 700 /home/youruser/.ssh
  - chmod 600 /home/youruser/.ssh/authorized_keys

  # Remove the provider's SSH drop-in, then reload
  - rm -f /etc/ssh/sshd_config.d/50-cloud-init.conf
  - systemctl restart ssh
```

Two of these lines are there because things went wrong for me.

**The SSH socket.** On Ubuntu 24.04, SSH is started by a systemd socket that listens on port 22. Changing `Port` in the config isn't enough on its own. Disabling the socket and running `ssh.service` directly makes sshd read its port from the config, like it used to.

**The provider's drop-in.** My provider's image ships its own `50-cloud-init.conf`, which can turn password login back on. sshd uses the first value it finds for each setting, and it reads the drop-ins in alphabetical order. So `50-cloud-init.conf` wins over `99-custom.conf`, and password login quietly stays enabled. Deleting that file fixes it. After your first login, check what sshd actually ended up with:

```bash
sudo sshd -T | grep -E '^(port|permitrootlogin|passwordauthentication) '
```

## Step 5: Install software from vendor repos

Tools like Tailscale, Caddy and CrowdSec come from their vendors' own apt repos. Add each repo with its signing key, then install:

```yaml
  - curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  - echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" > /etc/apt/sources.list.d/caddy-stable.list
  - apt-get update
  - apt-get install -y caddy
```

Two lessons from running this for almost a year:

- **Don't hard-code the Ubuntu release name.** One of my repo lines still says `jammy`, which is 22.04. Where a vendor offers a release-agnostic suite, like Caddy's `any-version`, use it. Otherwise read the codename from `/etc/os-release`.
- **A vendor repo can go down.** In October 2026, Caddy's apt repo started returning `402 Payment Required` because the project ran over its hosting quota. Any server built from my file while it was down would have come up without Caddy. If the software matters, add a fallback, such as the signed `.deb` from the project's GitHub releases, and check that it actually installed before moving on.

## Step 6: Turn the firewall on last

```yaml
  - ufw limit 2222/tcp comment 'SSH with rate limiting'
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw --force enable
```

Allow your SSH port before you enable the firewall, and make it the last thing in `runcmd`. If anything before it fails, you can still get in to find out why. Firewall rules get their own post in this series.

## Step 7: Validate it before you use it

Check the file on your own machine before pasting it anywhere:

```bash
cloud-init schema --config-file cloud-init.yml
```

After the first boot, check that cloud-init finished, and read its output if it didn't:

```bash
cloud-init status --long
sudo less /var/log/cloud-init-output.log
```

## Keep it in a repo

I keep the file in my infrastructure repo, with a version number and a short changelog at the top. Some of its contents, like my CrowdSec scenarios, also exist as standalone config files. A small script copies those files into the cloud-init between `BEGIN` and `END` markers, and can check whether the two have drifted apart. That way the server I'd rebuild matches the server I'm running.

Next in the series: the core utilities that go on every box.
