---
title: Refactoring in the Age of AI
date: 2026-05-18
---

It took me 3 weeks to vibe-code an unmaintainable mess. This isn't surprising - others have had the same experience - and have used it as an excuse to give up.

I persevered and forced the machine to refactor, eventually ending up with something with a better shape. What surprised me was how long and how many tokens it took to use vibe coding to refactor. Suddenly I was burning tokens at twice my normal pace, and the progress was glacial.

I guess it makes sense - any refactoring session is going to span the entire code base - so this gives you a large context by definition. I got there in the end after quite a few failed starts.

Some things definitely help with vibe-refactoring.

## Refactoring vs TDD

The LLM tools I used are conservative by default. At each refactoring step, it was very eager to preserve backward compatibility - even with unit tests - that ended up dropping legacy "shims" all over the place. I'm not really sure about TDD in the world of AI code generation to be honest - if you're generating tests for your classes as you generate the classes, the tests have limited value, as they are generated with similar prejudice to the original design.

I had to explicitly instruct the agent to ignore existing unit tests while refactoring, but even then it tied itself in knots. It's slow to rename classes, for example, and backs up very quickly from "scary" refactoring tasks.

## Semantic Anchors

If you aren't using [semantic anchors](https://openreview.net/forum?id=nlFVmB4EOu) yet then adopt them. Anchors have been described as magic spells, but they are just a shortcut to areas in the overall LLM vector space that group around a topic of interest, in my case, clean code. So terms like "Domain Driven Design", "Behaviour Definition", "Separation of Concerns" and others help the machine to understand your goal.

## Socratic Method

I commented earlier that at their current level of proficiency, LLMs behave similarly to mid-level developers. This includes classic mid-level dev mis-behaviours I was guilty of myself early in my career, and constantly work with when mentoring others:

* Over-application of design patterns, obscuring business logic
* Ignoring the overall design framework to solve short term goals (we all do this but there's skill in knowing when to use a tactical fix vs a strategic refactor)
* Poor cohesion leading to mingled concerns

My go-to method for working with engineers on this is to [ask questions](https://en.wikipedia.org/wiki/Socratic_method) - engineers love to explain their designs and encouraging them to understand the tradeoffs of a coding decision will often point them in the right direction.

This technique also works with the LLM - why is this class called X?

## Context Windows

Once your component - let's say it's a deployable artifact such as a function or container - goes beyond the size of your context window, it's going to become progressively more expensive to refactor, generate or maintain using LLM. Conceptually, the LLM can't hold it all in its memory. There are techniques that can help with this, but the fundamental logic stands.

But we all have context windows - this is why the industry as a whole moved toward microservices. By having different deployables with dedicated responsibilities, we can separate the system into units that are easier to understand, maintain, and ship. This works - but only if you understand the business well enough to partition it cleanly, and are willing to review the separation as the business evolves.

## Specification

There's some discussion right now about "spec driven development". In practice I think you need to document at least four perspectives so that your system is fit for good quality LLM code generation:

* Behaviour description - this is similar to BDD, and gherkin's a good tool. This is the product and QA perspective and the most important to preserve, as it describes the business goal.

* Design description - this describes how your system is decomposed, and the architectural style. This is the architecture and/or senior design perspective - should it be event driven, event sourced, n-layer, DDD, hex architecture, CQRS? What are the main components and what are their concerns? What tradeoffs exist between scalability, complexity and running costs? Your semantic anchors are vital here.

* Security description - what are the security boundaries of your system? How does each player and component authorize or represent identity to the next one?

* Interface description - What UX framework will you adopt? React, Native app, both? What API style do you want - OpenAPI sure, but REST, GraphQL or both? Will you have public consumers of API? This can include design screenshots.

I struggle with the idea that when we vibe code we commit the output rather than the prompt.

There is an argument that when LLM generates the code, then the code is no longer the artifact - In theory, if you have the above four documents, it should be possible to re-generate all the code from scratch - and therefore the code is disposable.

This can be a good - if expensive - test of the accuracy of your specification. Prompting the agent to generate and commit the specifications before another agent generates the code from the specification can help - I believe that this is the future of CI with LLM and tools and right now, we're starting to see frameworks emerging to do just that - [Devin](https://cognition.ai/) by Cognition and [Copilot Workspace](https://githubnext.com/projects/copilot-workspace/) by GitHub are early examples pointing in this direction.

In practice, I suspect most teams won't routinely re-generate systems from specification. More often, it'll be generated, edited and then committed. I've seen (and suffered from) generated API proxies and generated UI code that was manually hacked - often for good reason at the time.
