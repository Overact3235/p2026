---
title: "Giving each coding agent its own container"
description: "Why Claude Code and Codex now run in locked-down LXCs instead of my laptop."
pubDate: 2026-11-05
tags: ["homelab", "ai-agents", "proxmox"]
project: "home-lab"
draft: true
---

I used to run Claude Code and Codex on my MacBook. They now run in small LXC containers on a Proxmox box at home, and the Mac is a thin client: I SSH in over Tailscale and attach to tmux. Speed wasn't the reason. Credentials were.

## The problem

I have two GitHub identities: one for this site and my homelab repo, and a private personal account. On the Mac, both lived side by side. Any agent session could, in principle, read either account's token.

I also let agents run with fewer prompts than I used to. That's the point of them, but it means I'm not approving every command. So I wanted to assume an agent might eventually do something I didn't intend, whether through a bad prompt, a malicious file it reads, or plain error, and make sure the damage stays small.

## One container per identity

Each GitHub identity gets its own unprivileged Debian LXC with its own:

- fine-grained GitHub token, limited to the repos it needs
- git identity and agent logins
- Tailscale node and tag
- snapshots

If an agent in one container goes wrong, even if it gets root inside that container, it still can't read the other identity's token. An idle LXC costs about 50-100 MB of RAM, so a second one is cheap.

Inside each container, the agents run as a normal user with no sudo. A helper script, `agent-task`, starts each piece of work in its own git worktree, on its own branch, in its own tmux window, so parallel tasks don't trample each other.

## Keeping it off the network

The container sits on my home LAN, which has admin UIs I don't want an agent anywhere near. So each container has an nftables table that rejects new connections from any non-root user to private, tailnet and link-local addresses. The agent can reach GitHub and the internet, but not the rest of my house.

When an agent genuinely needs a LAN host, it gets one exact `host:port` exception in a config file. The first one was SSH to my staging VM. Anything not listed stays blocked, and a malformed entry stops the setup before the firewall loads.

I learned one thing the hard way here. The bootstrap script originally installed the firewall near the end. When a later step failed, the container was left with every tool installed and no firewall. Now the firewall goes in right after the base packages, before the agent user or tools exist, and the script stops if it isn't active.

## Automation without handing out root

Building these containers needs root on the Proxmox host, and I wanted to script it. The easy answer was passwordless sudo for an automation user. But then my Mac's SSH key becomes a root key for my hypervisor, and an agent in auto mode could drive it.

Instead, the automation user has exactly one sudo right: a root-owned wrapper script. That wrapper only acts on containers tagged `agent` with an `agent-` hostname, and only root can set that tag. When I need a new ability, it becomes a new subcommand of the wrapper. The sudoers file doesn't change.

I rejected listing individual `pct` commands in sudoers instead. `pct exec`, `pct push` and `pct set` are each effectively a root shell, and argument-level sudo rules are easy to get wrong.

The agents can also roll back my staging VM. They do it with a Proxmox API token that can see, power-cycle and snapshot that one VM, and nothing else.

## Things I chose not to do

My decisions log lists ten rejected options. A few of them:

- **One container with two Linux users.** It works until one user gets sudo, and agents have a way of ending up with sudo.
- **Dev containers.** Docker inside an unprivileged LXC needs extra permissions and adds attack surface for nothing a plain bootstrap script doesn't already give me.
- **Full `gh auth login` in the container.** OAuth grants every repo the account can see. A fine-grained token limits a leak to the repos on its list.
- **Proxmox's own per-container firewall.** It's stronger than nftables inside the container, because root in the container can't change it. But enabling it means turning on the datacenter firewall, on a node that also runs my fallback DNS. I'll revisit that once my tailnet access rules are tightened.

One small extra: a root-owned git hook in every container strips AI co-author lines from commit messages. Commits in my repos are authored by me, whichever tool wrote the first draft.
