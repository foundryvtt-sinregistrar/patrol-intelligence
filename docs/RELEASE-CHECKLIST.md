# Release checklist

The 2026-11-27 compatibility check passed the existing passive detection flow on Foundry 14.370, D&D5e 6.1.1 and Patrol 5.0.12, including two GM clients and handoff. It does not declare the complete proposed MVP ready or replace the remaining release checks. [Evidence and scope](DND5E-6.1.1-VALIDATION.md)

- [ ] Test module load in Foundry VTT 14.370 with Patrol 5.0.10 and D&D5e 6.0.6.
- [ ] Execute every scenario in `TEST-PLAN.md` with one and two GM clients.
- [ ] Confirm no player receives proposal content or can resolve a proposal.
- [ ] Confirm a disabled token follows unmodified Patrol behavior.
- [ ] Confirm a cooldown suppresses duplicate notifications.
- [ ] Confirm paused games and active combat produce no proposal.
- [ ] Do not mark manual control complete without a verified public Patrol per-token API.

The [extended validation](DND5E-6.1.1-EXTENDED-VALIDATION.md) also passed connected-player privacy and authorization, pause, combat, hidden targets, opaque walls, Patrol Undetectable and an unlit target beyond darkvision on 6.1.1/5.0.12. Historical version checks and full MVP release readiness remain distinct.

## Distribution

- [x] Adopt MIT using the license text from Spell Advancement, as requested by the maintainer.
- [x] Configure the existing `foundryvtt-sinregistrar/patrol-intelligence` GitHub repository, the manifest on `main`, and the stable `patrol-intelligence.zip` asset in the latest release.
- [x] Document native Git archive packaging in the [README](../README.md); include [LICENSE](../LICENSE) and exclude development files.
- [ ] Publish a matching version tag, ZIP and manifest, then verify the public installation and download URLs. Local configuration does not establish that these endpoints are already available.
