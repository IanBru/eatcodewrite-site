---
title: Writing software in the AI age
---

I've been writing code for forty years. I've been using Cursor for two weeks. I think there's a reasonable chance I'll never write another line of code directly.

I'm producing software at least 3-4 times faster than I used to. And it's only going to get better.

Instead of writing the code, I'm instructing the engineer. Right now, I'd estimate Cursor can write code at a level comparable to a mid-level engineer. It can design small systems with reasonable architecture, complete with unit tests and system tests. I've deployed a multi-agent system including retrieval-augmented generation with continuous integration, continuous deployment, and infrastructure as code—in Python, a language I don't even know particularly well.

Software engineering skills still matter. I knew enough to ask it to implement CI/CD and IaC. I could tell when Cursor was spinning out and get it back on track. The communication patterns and interactions between subsystems need to be defined, clarified, and refined. For now, that's the work that remains human.

And yak-shaving still hasn't gone away. It took a full day to understand why AWS's file ingestion from S3 doesn't work well with how AWS stores vectors in S3 (it's about filterable metadata). I lost another day because two components were interacting directly via HTTP when I'd asked the AI to use messaging—it missed the memo.

But there are implications. If you're in the business, you need to pay attention. If you're still writing code by hand, get the tools. Claude Code and Cursor lead the pack right now; this will probably change in due course. Be the person directing the AI, not the person replaced by it. If you're just getting into software engineering, you have an opportunity to be better with the tools than any of the old fogeys.