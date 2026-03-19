---
title: Control Planes in the Age of AI
date: 2026-03-19
---

Control planes are the dirty secret of enterprise development.

We need them everywhere. Your customer service agent needs one to issue a refund or process a support request. Your pricing team needs one to control how much you sell things for. Your finance team needs one to manage stock levels. The list goes on.

All of these control planes currently have user interfaces built for internal staff to use. And here's the problem: for the "dark matter" developers building them, control planes are painful. Often a back end engineer is maintaining a front end system, so they're already outside of their comfort zone. Every user wants a small modification. But no organization wants to assign high-end UX engineers to design a control plane, because there really aren't that many users and the work simply isn't that interesting. 

The result can be a sprawl of mediocre, hard-to-maintain user interfaces that nobody loves, especially those forced to use them.

AI changes this. It gives us new opportunities and forces us to rethink what control planes should look like and how they should be built.

## Three Architectures for the AI Age

Companies now face a fundamental choice about how to build control planes. I see three main options, each with different tradeoffs.

### Option 1: The Desktop AI Is Your Control Plane

In this approach, you assume your control plane is a desktop AI like Claude. Your APIs are modeled as MCPs (Model Context Protocols), and Claude uses them directly. This works well for smaller companies and gives you tremendous agility.

But it opens catastrophic security risks.

Most people don't realize how powerful their own computers are. This is why spear phishing is so effective. All an attacker needs to do is convince your control plane-via email or social engineering-that a certain transfer needs to be processed. "Your boss needs $50,000 wired immediately." The control plane sits on someone's laptop, has access to all your APIs, and executes the request. There's an implicit assumption that there is always a human in the loop.

Ask yourself: Can my Nigerian prince AI convince your control plane AI to do something expensive?

### Option 2: Generate Your Control Plane Automatically

At the opposite end of the spectrum: instead of manually building control planes with teams of backend developers who hate doing it, you build them automatically.

Here's how it could work: You have a standard prompt that "defines" the features of your control plane UX.

It might start with "Build a control plane for my API using React and SSO authentication, exposing the following API features". As long as your API is sufficiently discoverable, you can get this to work. As your API evolves, you can re-generate your control plane automatically. If you want control features like confirmation dialogs, you just add them to the prompt. Now, all you need to do is enhance your API, rebuild your UI from the prompt, which could take a few hours, and you're done. The feature becomes immediately available to the business user.

This feels feasible, but right now requires a high level of investment. Properly implemented, it could give tremendous control over how control planes work. You avoid the ongoing maintenance burden of hand-building and redeploying new systems. However, it mandates a high standard of automated software development practice: building fully functional code from prompts, automated testing, CI/CD, and proper API design. I believe larger enterprises might consider this, but right now it could be out of reach for smaller teams.

I seems more likely in the short term that this strategy will be used in "semi-automatic" mode. An engineer or product professional will run Cursor or similar tools to generate the front-end UX and tweak it, rather than it being automatically built end to end.  Many organizations already do this. That approach will work, but carries some risk and cost - you still need a skilled professional involved, and some may not understand the code for which they are now responsible.

### Option 3: Control via Server-Side Agentic Agents

The middle zone-and I believe the most likely long-term scenario for most businesses-is to assume that control planes are agentic, but those agents are deployed server-side, on your cloud infrastructure or in your enterprise environment.

You get the benefits of AI-driven control planes: natural language interfaces, adaptability, reduced need for hand-crafted UX. But you maintain a central point of control. Security policies, audit trails, and validation logic all live server-side, where you can enforce them consistently. You're not forcing everyone to use clunky custom UX. And you're not exposing your APIs to arbitrary desktop environments.

It's not perfect, but it's the architecture that balances security, maintainability, and user experience.

## Mining Legacy Control Planes for Gold

Don't start by throwing away your existing control planes.

Your legacy control planes encode valuable business logic and governance that you probably don't have documented anywhere else. Every confirmation dialog, validation rule, state machine, and role-based restriction exists for a reason. These aren't arbitrary UX choices - they're business rules that have evolved to protect your company, enforce compliance, and manage risk.

When you transition to agentic control planes, you need to preserve that logic. The patterns translate:

- **Confirmation dialogs** become human-in-the-loop checkpoints or secondary agent validation
- **Form validation** becomes API contracts and guardrails
- **Role-based access control** becomes agent permissions and policy enforcement
- **State machines** become agent decision flows and resource constraints
- **Denormalized data** becomes efficiency optimizations for agent decision-making

The work isn't discarding legacy code and starting fresh. It's understanding what business intent those patterns encode, and how to preserve it in your new architecture. A form field that seems redundant to a developer might be there because finance discovered a $2M bug five years ago. A workflow that looks cumbersome might exist because compliance requires an audit trail at each step.

Before you build your next control plane-especially if you're moving to an agentic architecture-audit your existing ones. Document the rules. Understand why each constraint exists. Then, as you design your new system, translate those constraints into agent-compatible mechanisms. You'll build something more robust, secure, and aligned with your actual business needs.

## The Transition

For many organizations, the transition won't be overnight. Legacy control planes won't disappear. But as you build new ones, or significantly refactor existing ones, you'll need to make a choice about which of these three paths you're taking.

### How to choose today

If you're deciding what to do right now, use this quick filter:

- **Choose Desktop AI** when speed matters most and blast radius is low. Ship a few MCPs but limit their capabilities.
- **Choose Option 2 (automatic generation)** if your API and delivery discipline are already mature and you don't want to retrain your users to use AI.
- **Choose Option 3 (server-side agentic)** if you're shipping a new control plane or replacing an existing one and you need good governance.

And regardless of option: start with one high-friction workflow, measure cycle-time and failure modes, and expand from there.  Observation and feedback are vital.

The key is to choose deliberately and to understand the security, maintenance, and UX implications of each option. And crucially: to learn from what came before. Control planes are invisible to your customers, but they're absolutely critical to your business. They deserve better than accidental architecture.