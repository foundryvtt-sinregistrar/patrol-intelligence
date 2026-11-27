# Release checklist

The 2026-11-27 compatibility check passed the existing passive detection flow on Foundry 14.370, D&D5e 6.1.1 and Patrol 5.0.12, including two GM clients and handoff. It does not declare the complete proposed MVP ready or replace the remaining release checks. [Evidence and scope](DND5E-6.1.1-VALIDATION.md)

- [ ] Test module load in Foundry VTT 14.370 with Patrol 5.0.10 and D&D5e 6.0.6.
- [ ] Execute every scenario in `TEST-PLAN.md` with one and two GM clients.
- [ ] Confirm no player receives proposal content or can resolve a proposal.
- [ ] Confirm a disabled token follows unmodified Patrol behavior.
- [ ] Confirm a cooldown suppresses duplicate notifications.
- [ ] Confirm paused games and active combat produce no proposal.
- [ ] Do not mark manual control complete without a verified public Patrol per-token API.
