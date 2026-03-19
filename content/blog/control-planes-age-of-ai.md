---
title: Control Planes in the Age of AI
date: 2026-03-19
---

Control planes are the dirty secret of enterprise development.

We need them everywhere. Your customer service agent needs one to issue a refund or process a support request. Your pricing team needs one to control how much you sell things for. Your finance team needs one to manage stock levels. The list goes on.

All of these control planes currently have user interfaces—built for internal staff to use. And here's the problem: for the developers building them, control planes are a bane. Every user wants a small modification. But we're not going to assign high-end UX engineers to design them, because there really aren't that many users. The result is a sprawl of mediocre, hard-to-maintain interfaces that nobody loves.

AI changes this. It gives us new opportunities—and forces us to rethink what control planes should look like entirely.

## Three Architectures for the AI Age

Companies face a fundamental choice about how to build control planes going forward. There are three main options, each with different tradeoffs.

### Option 1: Desktop AI (High Risk, High Agility)

In this approach, you assume your control plane is a desktop AI like Claude. Your APIs are modeled as MCPs (Model Context Protocols), and Claude uses them directly. This works well for smaller companies and gives you tremendous agility.

But it opens catastrophic security risks.

Most people don't realize how powerful their own computers are. This is why spear phishing is so effective. All an attacker needs to do is convince your control plane—via email or social engineering—that a certain transfer needs to be processed. "Your boss needs $50,000 wired immediately." The control plane sits on someone's laptop, has access to all your APIs, and executes the request.

The question becomes: can a Nigerian prince, posing as your CEO, convince your control plane to do something expensive?

### Option 2: Automatic Generation (Maintainability, Discipline)

At the opposite end of the spectrum: instead of manually building control planes with teams of backend developers who hate doing it, you build them automatically.

Here's how it works: as new control plane features emerge, or as the APIs that control planes use change, you write a prompt. That prompt generates a new control plane in hours. The feature becomes immediately available to the business user.

This approach gives you tremendous control over how control planes work. You avoid the ongoing maintenance burden of hand-building and redeploying new systems. But it mandates a certain amount of automated software development practice—automated testing, CI/CD, proper API design. To be honest, anyone building bespoke software in the age of AI should have these practices anyway.

### Option 3: Server-Side Agents (The Pragmatic Middle)

The middle zone—and I believe the most likely long-term scenario for most businesses—is to assume control planes are agentic, but those agents are deployed server-side. On your cloud infrastructure, or in your enterprise environment.

You get the benefits of AI-driven control planes: natural language interfaces, adaptability, reduced need for hand-crafted UX. But you maintain a central point of control. Security policies, audit trails, and validation logic all live server-side, where you can enforce them consistently. You're not forcing everyone to use clunky custom UX. And you're not exposing your APIs to arbitrary desktop environments.

It's not perfect, but it's the architecture that balances security, maintainability, and user experience.

## Mining Legacy Control Planes for Gold

Here's a critical insight: don't start by throwing away your existing control planes.

Your legacy systems encode valuable business logic and governance that you probably don't have documented anywhere else. Every confirmation dialog, validation rule, state machine, and role-based restriction exists for a reason. These aren't arbitrary UX choices—they're business rules that have evolved to protect your company, enforce compliance, and manage risk.

When you transition to agentic control planes, you need to preserve that logic. The patterns translate:

- **Confirmation dialogs** become human-in-the-loop checkpoints or secondary agent validation
- **Form validation** becomes API contracts and guardrails
- **Role-based access control** becomes agent permissions and policy enforcement
- **State machines** become agent decision flows and resource constraints
- **Denormalized data** becomes efficiency optimizations for agent decision-making

The work isn't discarding legacy code and starting fresh. It's understanding what business intent those patterns encode, and how to preserve it in your new architecture. A form field that seems redundant to a developer might be there because finance discovered a $2M bug five years ago. A workflow that looks cumbersome might exist because compliance requires an audit trail at each step.

Before you build your next control plane—especially if you're moving to an agentic architecture—audit your existing ones. Document the rules. Understand why each constraint exists. Then, as you design your new system, translate those constraints into agent-compatible mechanisms. You'll build something more robust, secure, and aligned with your actual business needs.

## The Transition

For many organizations, the transition won't be overnight. Legacy control planes won't disappear. But as you build new ones, or significantly refactor existing ones, you'll need to make a choice about which of these three paths you're taking.

The key is to choose deliberately—and to understand the security, maintenance, and UX implications of each option. And crucially: to learn from what came before. Control planes are invisible to your customers, but they're absolutely critical to your business. They deserve better than accidental architecture.