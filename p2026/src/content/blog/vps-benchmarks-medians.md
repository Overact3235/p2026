---
title: "Benchmarking a shared VPS: trust the median"
description: "Five runs each of Geekbench, 7-Zip and Blender on my VPS after 26.04."
pubDate: 2026-11-05
tags: ["vps", "benchmarks", "self-hosting"]
draft: true
---

After moving my VPS to Ubuntu 26.04.1, I wanted a performance baseline to compare against later. I expected to run Geekbench once and write down a number. I ended up running four benchmarks five times each, because the first thing I learned is that one run on a shared VPS tells you almost nothing.

## The box

6 vCPU, about 12 GB of RAM, Ubuntu 26.04.1. It wasn't idle either. The Minecraft server, n8n and Uptime Kuma kept running throughout, because that's the load it actually carries.

I couldn't even find out what CPU it has. `lscpu` reports `AMD EPYC Processor (with IBPB)`, which is QEMU's generic EPYC model. It hides the real host chip from the guest, and Geekbench can't see past it either. My notes had a "most likely" model written next to an old result. That was a guess, and I've marked it unconfirmed.

## Five runs, back to back

| Benchmark | Median | Spread across 5 runs |
|---|---|---|
| Geekbench 6.7.1 single-core | 1000 | 6% |
| Geekbench 6.7.1 multi-core | 3297 | 20% |
| Geekbench 7.0.0 single-core | 941 | 10% |
| Geekbench 7.0.0 multi-core | 3550 | 31% |
| 7-Zip 26.00 `7z b`, total | 19917 MIPS | 23% |
| Blender 5.2.0, three scenes summed | 46.5 samples/min | 16% |

Single-core numbers stay fairly tight. Anything that uses every core swings a lot, because other tenants on the same physical host share those cores. Geekbench 7 multi-core moved 31% between two runs taken minutes apart. 7-Zip's compression score alone moved 39%.

The old single result shows why this matters. In January I ran Geekbench 6.5.0 once and got 1056 single-core and 2922 multi-core. Next to this week's medians, that suggests single-core got worse and multi-core got better. Maybe something did change: a different host, a different version, a different neighbour. With one run from back then, I can't tell, and I'd have happily read a story into it.

So my rule now: run it five times, compare medians, and write down the range next to them.

## Things that went wrong

**Geekbench 7 prints no scores.** The free CLI only prints an upload link, and local export is a Pro feature. Every score in that table came from a results page.

**Five Geekbench 6.5.0 runs produced nothing.** I wanted to compare 6.5.0 with 6.7.1 on the same box. All five runs finished their workloads, about 40 minutes of benchmarking, and then failed to upload with `unknown error (internal code 35)`. No upload means no score. That code matches curl's TLS-connect error, and other versions uploaded fine earlier the same day, so I still don't know whether it was the version or the upload service.

**Blender needed desktop libraries.** On a headless server the benchmark died at "Warming up monster" with `Did not receive Benchmark JSON Data`. It needs a few X11 and GL libraries even when nothing is drawn on screen:

```bash
sudo apt-get install -y libxfixes3 libxi6 libsm6 libice6 libgl1
```

**I benchmarked against myself.** A second copy of my run script started by accident and overlapped two 7-Zip runs. They scored around 13,000 MIPS against roughly 20,000 for the clean runs. I threw them out and kept the logs as a reminder.

One thing that did work: starting the long runs with `setsid nohup`, so closing my laptop didn't kill a nearly 50-minute Geekbench 7 batch.

## What I kept

Raw logs, `lscpu` output and the run scripts all went into my infrastructure repo, next to a notes file with the tables. When I replace this VPS, I'll run the same scripts on the new one and compare medians.
