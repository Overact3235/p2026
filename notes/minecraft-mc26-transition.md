# Minecraft mc26 Transition

Last updated: 2026-04-05

## Current state

- Runtime in production is Paper on `1.21.11`.
- `26.1` support is not ready in Paper yet, so this work stays as a staged transition plan.
- Existing public endpoint is `mc.p2026.xyz` behind TCPShield.
- VPS memory is `12 GB`, so any parallel migration needs to leave headroom for the OS, Docker, CrowdSec, backups, and other services.

## Recommendation

- Keep the current `1.21.11` server online during the transition.
- Bring up a second Paper container for `26.1.x` only after stable Paper builds and plugin compatibility are available.
- Treat the second container as a temporary migration lane, not a permanent dual-public deployment, unless there is a clear gameplay reason to keep both worlds live.

## Memory target

- Target `4G` as the container memory limit for the future `mc26` test container.
- Do not set both the Docker memory cap and Java heap max to `4G`.
- If the container is capped at `4G`, keep Java heap below that cap, for example `-Xms2G -Xmx3G`.
- If you want true `4G` heap for Paper `26.1.x`, give the container more than `4G` total memory so native overhead does not trigger OOM kills.

## Dual-container stance

- A second container is reasonable on a `12 GB` VPS for migration and testing.
- It is less comfortable if both servers are busy at the same time, especially during world generation, backups, or plugin-heavy startup.
- Preferred shape:
  - keep `1.21.11` as the public server on the current endpoint
  - run `mc26` on a separate container, separate data path, and separate port
  - keep `mc26` non-public at first, or gate it behind a separate temporary hostname
- Do not point both containers at the same world directory.

## World strategy

- Preserve the current world as an untouched rollback copy.
- Test the upgrade on a cloned world directory first.
- If a fresh start sounds more fun, create a new `26.1.x` world and record the current seed separately.
- Same-seed world generation should be treated as "similar start" rather than a backup substitute.

## Security notes

- TCPShield and CrowdSec are complementary, not replacements for each other.
- TCPShield is the public-facing Minecraft protection layer. Keep using it for the public endpoint.
- CrowdSec remains useful on the VPS for host-level blocking and broader service protection, but it should not be treated as the main Minecraft DDoS control.
- If proxy protocol is used instead of the TCPShield plugin, firewall rules should only allow inbound Minecraft traffic from TCPShield proxy ranges.
- A non-public `mc26` test container should stay off the public internet if possible.

## Upgrade gates

- Stable Paper build for `26.1.x`
- Java `25` runtime available on the VPS
- Plugin compatibility checked for every installed plugin
- Backup storage verified before any world conversion

## Cutover outline

1. Take a full offline backup of the current server directory.
2. Clone the current world into a separate test directory.
3. Create a second container for `mc26` with its own volume, port, and logs.
4. Move the test container to Java `25`.
5. Start `mc26` against the cloned world and verify upgrade behavior.
6. Validate plugins, join flow, dimensions, and basic gameplay.
7. Decide between:
   - promoting the upgraded cloned world
   - starting fresh on a new `26.1.x` world
   - keeping `1.21.11` longer and deferring cutover
8. Switch public routing only after the test container is stable.
