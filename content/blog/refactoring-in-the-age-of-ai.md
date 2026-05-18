---
title: Refactoring in the Age of AI
date: 2026-05-18
---

It took me 3 weeks to [vibe-code](https://en.wikipedia.org/wiki/Vibe_coding) an unmaintainable mess. This isn't surprising - others have had the same experience - and have used it as an excuse to give up.

I persevered and forced the machine to refactor, eventually ending up with something with a better shape. What surprised me was how long and how many tokens it took to use vibe coding to refactor. Suddenly I was burning tokens at twice my normal pace, and the progress was glacial.

I guess it makes sense - any refactoring session is going to span the entire code base - so this gives you a large context by definition. I got there in the end after quite a few failed starts.

Some things definitely help with vibe-refactoring.

## Be prepared to break your unit tests

The LLM tools I used are conservative by default. At each refactoring step, it was very eager to preserve backward compatibility - even with unit tests - that ended up dropping legacy ["shims"](https://en.wikipedia.org/wiki/Shim_(computing)) all over the place. 

I'm not really sure about TDD in a world of AI code generation - if you're generating tests for your classes as you generate the classes, the tests have limited value.  They will be generated with similar prejudice to the original design.

I had to explicitly instruct the agent to ignore existing unit tests while refactoring, but even then it tied itself in knots. It's slow to rename classes, for example, and backs up very quickly from "scary" refactoring tasks.

Of course, with any refactoring task, you still need test coverage.  Before you begin your refactor, move up the test pyramid and have your machine generate good behaviour tests at the API and/or UI level instead.

## Prompt using well known semantics

If you aren't using [semantic anchors](https://github.com/LLM-Coding/Semantic-Anchors) yet then adopt them. 

Semantic anchors have been described as magic spells, but they are just a shortcut to areas in the overall LLM vector space that group around a topic of interest, in my case, clean code. So terms like "Domain Driven Design", "Behaviour Definition", "Separation of Concerns" and others help the machine to understand your goal.

## Query the design decisions

As I've [written before](https://www.eatcodewrite.com/blog/writing-software-in-the-ai-age), at their current level of proficiency, LLMs behave similarly to mid-level developers. This includes classic mid-level dev mis-behaviours I was guilty of myself early in my career, and constantly address when mentoring others:

* Blindly applying design patterns, obscuring business logic
* Ignoring the overall design framework to solve short term goals 
  * We all do this - but there's a skill in knowing when to choose a "tactical fix" over a strategic refactor
* Poor cohesion, with a single feature implemented across a wide code base
* Organising code around software concepts rather than business concepts

My go-to method for working with engineers on this is to [ask questions](https://en.wikipedia.org/wiki/Socratic_method) - engineers love to explain their designs and encouraging them to understand the tradeoffs of a coding decision will often point them in the right direction.

This technique also works with the LLM - a classic interaction can look like this

"Why is this class called PlayerStatistics when it describes the stats for NPCs as well as players?"

The answer is typically along the lines of

"It started out as player statistics and its role has now changed.  Let's rename it to CharacterStatistics"

## Use services of the right size

Once your component - let's say it's a deployable artifact such as a function, container, or module - goes beyond the size of your context window, it's going to become progressively more expensive to refactor, generate or maintain using LLM. This stacks - each request to the LLM requires a larger context so every time you attempt a task, you burn more tokens.

Conceptually, the LLM can't hold it all in its memory. There are indexing and vectorization techniques that can help with this, but the fundamental logic stands.

This is not a new problem - we all have context windows!  This is why the industry as a whole moved toward microservices. By having different deployables with dedicated responsibilities, we can separate the system into units that are easier to understand, maintain, and ship. 

This works - but only if you understand the business well enough to partition it cleanly, and are willing to review the separation as the business evolves.  It's OK to split a service that gets too big. It's also OK to join services that are tightly coupled.

## But is this really necessary?

As I learned from my refactoring exercise and then discussed it with other architects, I found myself wondering whether refactoring is really the best course of action in the long term.  *Spec Driven Development* is a hot topic right now for good reason.

Granted, there's nothing new under the sun - we've always had specification - but the question we need to consider is whether the specification can now trump the code itself?

I struggle with the idea that when we vibe code we commit the output rather than the prompt.

In practice I think you need to document a system from at least four perspectives - behaviour, design, security, and interface - so that your system is fit for good quality LLM code generation.

So - if we aren't writing code, what are we writing?

## Describe your system

* **Describe the behaviour** - this is similar to [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development), and [Gherkin](https://cucumber.io/docs/gherkin/) is a good tool. This is the product and QA perspective and the most important to preserve, as it describes the business goal.

* **Describe the architecture** - this describes how your system is decomposed, and the architectural style. This is the architecture and/or senior design perspective - should it be event driven, event sourced, n-layer, [DDD](https://en.wikipedia.org/wiki/Domain-driven_design), [hex architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)), [CQRS](https://martinfowler.com/bliki/CQRS.html)? What are the main components and what are their concerns? What tradeoffs exist between scalability, complexity and running costs? Your semantic anchors are vital here.

* **Describe the security** - what are the security boundaries of your system? How does each component represent identity and authorization to the next one?

* **Describe the interface** - What UX framework will you adopt? React, Native app, both? What API style do you want - OpenAPI sure, but REST, GraphQL or both? Will you have public consumers of API? Does it have to be accessible? This is the right place to include screenshots - either from a legacy system you're replacing, or from your UX design team.

Feed the entire description into your coding agents. But feed subsets of the description to different agents with dedicated roles that are responsible for architecture review, QA, security audit, and so forth. These can generate tests too.

## Can you re-generate your system?

There is an argument that when LLM generates the code, then the code is no longer the artifact - In theory, if you have a sufficiently well described system, it should be possible to re-generate all the code from scratch - and therefore the code is disposable.

Moreover, as LLM code generation improves, you will want to rewrite your system to take advantage - just as we re-compile code now to take advantage of compiler optimization.

This can be a good - if expensive - test of the accuracy of your specification. Prompting the agent to generate and commit the specifications before another agent generates the code from the specification can help.  

I believe that this is the future of CI with LLM and tools and right now, we're starting to see frameworks emerging to do just that - [Devin](https://cognition.ai/) by Cognition and [Copilot Workspace](https://githubnext.com/projects/copilot-workspace/) by GitHub are early examples pointing in this direction.

Unfortunately in practice, I suspect most teams won't routinely re-generate systems from specification. For now at least, it'll be generated, edited or re-prompted and then committed. 

There's precedence here. I've seen and suffered from generated API proxies and generated UI code that has been manually hacked - often for good reason at the time - perhaps the proxy tool didn't support a new protocol feature, or the engineer using the tool didn't want to learn how to use it. 

This rarely ends well, but it's very common.  Anyone maintaining a SaaS API over the long term will have some clients parsing XML and/or JSON directly, breaking in completely unexpected ways when the API is revised.

I believe this is the challenge of the new age. Development organizations that can adopt a practice of disposable code will be the ones that can prosper in the new era.  

I never learned to MOV, JMP or RET.  There's an entire generation of engineers that know how to manage memory directly, write super-efficient code, and implement compilers. These days it's a niche practice.

Will the next generation of engineers be able to ignore the generated code and focus entirely on design, security, architecture and behaviour?  Quite possibly.  
