---
title: "Benchmarking a shared VPS: five runs and the median"
description: "How to benchmark a VPS with Geekbench, 7-Zip and Blender, and read results honestly."
pubDate: 2026-11-05
tags: ["vps", "benchmarks", "self-hosting"]
draft: false
---

This is how to get a performance baseline for a VPS that you can compare against later, for example when you move to a new plan or provider. It uses four free benchmarks, runs each one five times, and compares medians.

Why five runs? On a shared VPS, other tenants use the same physical cores. On mine, the Geekbench 7 multi-core score moved 31% between two runs taken minutes apart. A single run can land anywhere in that range, so on its own it tells you very little.

## What you'll run

| Benchmark | Measures | Time per run | Results |
|---|---|---|---|
| Geekbench 6 | Single- and multi-core CPU | about 8 min | Uploaded, read online |
| Geekbench 7 | Single- and multi-core CPU, new scale | about 9 min | Uploaded, read online |
| 7-Zip `7z b` | Compression and decompression | about 35 s | Printed locally |
| Blender Benchmark | CPU rendering, three scenes | about 3 min | JSON, locally |

Five runs of everything takes about an hour and 45 minutes. Run the benchmarks on the server's normal load, not on an idle box, and write down what was running. My VPS kept its Minecraft server, n8n and Uptime Kuma running throughout, because that's the load it actually carries.

## Step 1: Record the machine

```bash
lscpu | grep -E 'Model name|^CPU\(s\)|MHz'
nproc
free -h
```

Save the full `lscpu` output next to your results. Don't be surprised if it doesn't name a real CPU. Mine reports `AMD EPYC Processor (with IBPB)`, which is QEMU's generic EPYC model. It hides the host's actual chip from the guest, and Geekbench can't see past it either. Record it as "unknown" rather than guessing.

## Step 2: Install the benchmarks

Everything goes in one working directory:

```bash
mkdir -p ~/bench && cd ~/bench
```

**Geekbench 6 and 7.** Both need an internet connection, because the free editions upload every result to the Geekbench Browser:

```bash
wget https://cdn.geekbench.com/Geekbench-6.7.1-Linux.tar.gz
wget https://cdn.geekbench.com/Geekbench-7.0.0-Linux.tar.gz
tar xf Geekbench-6.7.1-Linux.tar.gz
tar xf Geekbench-7.0.0-Linux.tar.gz
```

Geekbench 7 uses a new scale. Compare its scores only with other Geekbench 7 runs, never with Geekbench 6.

**7-Zip.** On Ubuntu 26.04 it's in the `7zip` package:

```bash
sudo apt install 7zip
```

**Blender Benchmark.** Download the Linux command-line launcher from [opendata.blender.org](https://opendata.blender.org) into `~/bench` and extract it. On a headless server, Blender also needs a few X11 and GL libraries, even though nothing is drawn on screen. Without them, it fails at "Warming up monster" with `Did not receive Benchmark JSON Data`:

```bash
sudo apt-get install -y libxfixes3 libxi6 libsm6 libice6 libgl1
```

Then download a Blender version and the three standard scenes:

```bash
./benchmark-launcher-cli blender list
./benchmark-launcher-cli blender download 5.2.0
./benchmark-launcher-cli scenes download --blender-version 5.2.0 monster junkshop classroom
```

## Step 3: Run everything five times

Save this as `~/bench/bench.sh`. It runs each benchmark five times back to back, keeps one log per run, and writes a summary:

```bash
#!/bin/bash
# Five runs each of Geekbench 6, Geekbench 7, 7-Zip and Blender.
cd ~/bench
S=summary.log; : > "$S"
lscpu > lscpu.txt
for i in 1 2 3 4 5; do
  ./Geekbench-6.7.1-Linux/geekbench6 > gb6-run$i.log 2>&1
  grep -oE 'https://browser.geekbench.com/v6/cpu/[0-9]+$' gb6-run$i.log | sed "s/^/gb6 run$i /" >> "$S"
done
for i in 1 2 3 4 5; do
  ./Geekbench-7.0.0-Linux/geekbench7 > gb7-run$i.log 2>&1
  grep -oE 'https://browser.geekbench.com/v7/cpu/[0-9]+$' gb7-run$i.log | sed "s/^/gb7 run$i /" >> "$S"
done
for i in 1 2 3 4 5; do
  7z b > 7z-run$i.log 2>&1
  echo "7z run$i $(awk '/^Tot:/ {print $NF}' 7z-run$i.log)" >> "$S"
done
for i in 1 2 3 4 5; do
  ./benchmark-launcher-cli benchmark --blender-version 5.2.0 --device-type CPU --json \
    monster junkshop classroom > blender-run$i.json 2> blender-run$i.err
  echo "blender run$i $(grep -oE '"samples_per_minute": *[0-9.]+' blender-run$i.json | tr '\n' ' ')" >> "$S"
done
echo "all done $(date -Is)" >> "$S"
```

Start it so that it survives a dropped SSH session or a closed laptop:

```bash
chmod +x ~/bench/bench.sh
setsid nohup ~/bench/bench.sh > ~/bench/bench.out 2>&1 &
tail -f ~/bench/summary.log
```

Only start it once. If two copies run at the same time, they compete for the same cores and every result is wrong.

## Step 4: Collect the scores

- **Geekbench:** neither free CLI prints scores locally, and Geekbench 7's local export is a paid feature. Open each link in `summary.log` and read the single-core and multi-core scores from the results page.
- **7-Zip:** the summary has the total rating from each run's `Tot:` line, in MIPS. Higher is better.
- **Blender:** the summary has samples per minute for each scene. Compare scene by scene, or add the three together.

If a Geekbench upload fails, that run has no score at all. Five of my Geekbench 6.5.0 runs finished their workloads and then failed to upload with `unknown error (internal code 35)`, which left nothing to read. Check the summary for missing links and re-run those.

## Step 5: Take the median and write down the spread

For five numbers, the median is the middle one once they're sorted. The spread is how far apart the highest and lowest are. This prints both:

```bash
printf '%s\n' 3438 2857 3406 3181 3297 | sort -n |
  awk '{v[NR]=$1} END {printf "median %s, spread %.0f%%\n", v[3], (v[NR]-v[1])/v[1]*100}'
# median 3297, spread 20%
```

Compare medians between machines, never single runs. Keep the spread next to the median. A difference smaller than the spread is probably noise.

## Example: my VPS on Ubuntu 26.04.1

6 vCPU, about 12 GB of RAM, normal load:

| Benchmark | Median | Spread across 5 runs |
|---|---|---|
| Geekbench 6.7.1 single-core | 1000 | 6% |
| Geekbench 6.7.1 multi-core | 3297 | 20% |
| Geekbench 7.0.0 single-core | 941 | 10% |
| Geekbench 7.0.0 multi-core | 3550 | 31% |
| 7-Zip 26.00 total | 19917 MIPS | 23% |
| Blender 5.2.0, three scenes summed | 46.5 samples/min | 16% |

Single-core scores stay fairly tight. Anything that uses every core swings much more, because that's where other tenants get in the way. 7-Zip's compression score alone moved 39% between runs.

Here's why one run isn't enough. Months earlier, I ran Geekbench 6 once on the same VPS and got 1056 single-core and 2922 multi-core. Next to these medians, that suggests single-core got worse and multi-core got better. Maybe something changed, maybe not. With one run, there's no way to tell.

## Keep the raw data

Keep the logs, `lscpu.txt`, `summary.log` and the script together, ideally in a repo. When you move to a new server, run the same script there and compare medians against these.
