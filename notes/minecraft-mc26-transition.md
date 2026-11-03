# Minecraft mc26 Transition

Last updated: 2026-10-10

## Current state

- Runtime in production is Paper on `1.21.11`.
- `26.1` support is not ready in Paper yet, so this work stays as a staged transition plan.
- The public endpoint sits behind TCPShield.
- Target VPS size is `2 vCPU` and `4 GB` RAM. That is enough for one Paper server when the world is pre-generated, because chunk generation is the main CPU and memory spike during normal play.

## Recommendation

- Keep the current `1.21.11` server online during the transition.
- Bring up a `26.1.x` test server only after stable Paper builds and plugin compatibility are available.
- On a `4 GB` VPS, run one server at a time. Test the upgrade somewhere else (a local machine or a home lab box), or stop the public server for a planned test window.
- Pre-generate the world before opening it to players, so the server isn't generating new chunks under load.

## Memory target

- Leave about `1 GB` for the OS, Docker, CrowdSec, and backups.
- Set the Paper container's memory limit to about `3G`, and keep Java heap below that cap, for example `-Xms2G -Xmx2G` (or up to `-Xmx2560M`).
- Do not set the Docker memory cap and Java heap max to the same value. Java needs headroom outside the heap, and without it the container gets OOM-killed.

## Test server stance

- A second container running alongside the public one does not fit on `4 GB`. Running both would starve the public server or trigger OOM kills.
- Preferred shape:
  - keep `1.21.11` as the public server on the current endpoint
  - run the `mc26` test on a separate machine, with its own data path and port
  - keep the test server off the public internet, or gate it behind a separate temporary hostname
- Do not point two servers at the same world directory.

## World strategy

- Preserve the current world as an untouched rollback copy.
- Test the upgrade on a cloned world directory first.
- If a fresh start sounds more fun, create a new `26.1.x` world and record the current seed separately.
- Same-seed world generation should be treated as "similar start" rather than a backup substitute.
- Whichever world is chosen, pre-generate it to a fixed border before going live.

## Protection: recommended setup

This is the setup I'd recommend for any public Minecraft server, and the one to carry into future architectures.

- Put TCPShield in front of the public endpoint. It is the Minecraft-aware protection layer and absorbs attacks before they reach the VPS.
- Run CrowdSec on the host as well. TCPShield and CrowdSec complement each other: CrowdSec handles host-level blocking and protects the other services on the box, but it is not the main Minecraft DDoS control.
- If proxy protocol is used instead of the TCPShield plugin, firewall rules should only allow inbound Minecraft traffic from TCPShield's proxy ranges.
- Keep any test server off the public internet if possible.

## Upgrade gates

- Stable Paper build for `26.1.x`
- Java `25` runtime available on the VPS
- Plugin compatibility checked for every installed plugin
- Backup storage verified before any world conversion

## Cutover outline

1. Take a full offline backup of the current server directory.
2. Clone the current world onto the test machine.
3. Set up the test server with Java `25`, its own data path, port, and logs.
4. Start `mc26` against the cloned world and verify upgrade behavior.
5. Validate plugins, join flow, dimensions, and basic gameplay.
6. Decide between:
   - promoting the upgraded cloned world
   - starting fresh on a new `26.1.x` world
   - keeping `1.21.11` longer and deferring cutover
7. Pre-generate the chosen world.
8. In a planned window, stop `1.21.11`, move the chosen world and config to the VPS, start `mc26`, and switch public routing.
