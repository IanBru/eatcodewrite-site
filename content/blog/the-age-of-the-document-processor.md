---
title: AI and the return of the Document Processor
date: 2026-10-12
---

_"It's all just wrappers around the database anyway"_.  

That was back in the late 90s, the most cynical comment about system design I'd heard yet. 15 years later, [Greg Young](https://www.eventstore.com/blog/transcript-of-greg-youngs-talk-at-code-on-the-beach-2014-cqrs-and-event-sourcing) taught me that all systems are just chains of events. Accountants and ERP specialists put everything on the general ledger. [BPMN](https://www.bpmn.org/) consultants can convince you that everything is a workflow.

They're all right, sometimes. And they're all wrong sometimes. The architect's job is to fit the application pattern to the domain. The difference matters. A workflow system modelled through a few status columns is painful to maintain. A ledger updated after the fact from the "audit" stream of a workflow engine will struggle to maintain transactional integrity. Event sourcing makes an expensive content management system.

## Model to Model, the revenge

Lately I've been seeing an old application pattern come back to life, and I think it's central to the new systems that we can now build.

I'm calling it the _document processor_, but it has a rich history of names including ["Model to Model"](https://en.wikipedia.org/wiki/Model_transformation), [MDA](https://www.omg.org/mda/) and others. The idea isn't new - I wrote an XSLT training course in 2006. I loved the language and its mathematical elegance. It was intended as the ideal document processor, just as XML was seen as the ideal document format.

Document processing had a brief flurry of popularity, but it quickly became a niche pattern.  The models - typically XML - had to be strongly typed and defined in advance. The processors were difficult to understand, and even more difficult to write and maintain. Implementations rotted on the vine, because compilers and transpilers are difficult to code. It lived on in EDI and other places, but largely went undiscussed for years.

We're building document processors again, without talking about it. Here are some I've seen built recently to implement powerful automation facilities:

### Software Factories
```
Spec -> Acceptance Tests -> Design -> Code & Tests -> Artifact
```
### Reverse Engineering
```
Code -> Function Points -> Business Definition -> Spec
```
### RFT to Tender
```
RFT -> Sections -> Tender -> Validator -> Submission
```

## Why now, and does it matter?

AI changes the game. The inputs can be messy human artifacts and we can layer in structure as we go. Documents don't need to be perfectly typed any more. Often they combine structured and unstructured data - think markdown files with YAML headers, or JSON files containing language snippets. Git can maintain a reasonable history, humans can edit them, but they can still be processed by the machine.

AI can write and rewrite the transforms cheaply and they can be replaced on demand. Compilers and transpilers can use LLM, or can be entirely deterministic but maintained by an LLM. Translation is a core LLM competency, and building translation engines just isn't that much of a stretch.  

Having said that, friends don't let ~~friends~~ agents [parse HTML with regular expressions](https://stackoverflow.com/a/1732454). Get the AI to use a native parser for your source format, where available.

Like any application pattern, document processors come with their own set of rules, quirks, advantages and disadvantages.  If you're building one, it helps to know about it.

I built a reverse engineering software factory over the past few months, and I think I've learned a few things - I'm hoping you can avoid my mistakes.  

## What's a document processor?

Documents have types - that much comes straight from [M2M](https://en.wikipedia.org/wiki/Model_transformation).  Each type should be versioned - I find SemVer a useful approach.  They're not quite the same as events or formal models though - generally they will be human readable and depending on the use case, they might potentially be human editable.

A document processor is a directed acyclic graph made up of one or more document processing units.

Each unit accepts one or more documents of a certain type and emits one or more other documents.

The processing units largely fall into compiler-equivalent categories:

* *Splitters*: These take a large document (like a giant RFT or a massive codebase) and split it into smaller documents that make coherent sense - small enough to reason about (or fit in an affordable context window)
* *Linkers*: These establish relationships between different documents - used to take small reasonable pieces and establish a narrative.
* *Generators or Transformers*:  Used to create new document types based on predecessor documents. Think code generation,  assembling a business definition from function points, or generating BPMN.
* *Classifiers*: Group or tag documents based on their purpose. Used for indexing, domain grouping and for establishing intent.
* *Validators*: Check a document against its defined rules and purpose. 

### Less is more when it comes to AI

My first mistake was an LLM call in every unit. Eventually I realised that only the classifiers actually needed LLM and even that was far from frontier-model LLM. Out of the 8 document processing units I started with, only one still burns tokens. 

The best document processing chains seem to use very little LLM. Most document processing units can be deterministic - this gives predictability. Dex Horthy has discussed this in the context of [agent development](https://github.com/humanlayer/12-factor-agents) too - we "sprinkle" the AI into a mostly-deterministic system.

Let the AI introduce possibility, and let the deterministic validators and compiler introduce predictability. 

In these systems, the role of "smart" LLM is in maintaining the pipeline itself.  Once a unit becomes inadequate, you replace it with an alternative AI-coded compiler.  This model has been described as ["Compiled AI"](https://arxiv.org/abs/2604.05150). 

![A reverse engineering chain: a codebase flows through a splitter, linker, classifier, generator and validator to produce a validated spec. Every unit is deterministic code except the classifier, which uses a small, cheap LLM. At build time, a smart frontier AI writes, tests and replaces each unit.](images/the-age-of-the-document-processor/processing-chain.svg "Dumb AI at run time, smart AI at build time.")

### Validate the graph

Realise earlier than I did that you're working with versioned documents.  Establish provenance via document versions. But don't let the LLM take that overboard - it's not a blockchain. I spent quite a while ripping out SHA256 logic that my LLM had fantasised in just because I used the semantic hook "provenance".

Make sure that your flow is correct, and that you can re-process your source documents as needed.  It'll take a few tries to get this right.  Make sure your graph doesn't contain cycles, and that documents flow correctly through.  Build this into your ADRs and also into your integration tests.

### Learn from the data engineers

Document processors aren't a huge distance away from ETLs. They are more loosely structured, they can allow for human intervention where needed, and some of the content can be less schema-obsessed. 

There are a lot of engineering lessons in data mining and data processing that can be directly applied to document processing units including Python libraries, parsers, and training courses.  Look at [Dagster](https://docs.dagster.io/guides/build/assets) and [OpenLineage](https://openlineage.io/) for examples of how they're approaching similar problems.

### Measure convergence

Predictable doesn't mean correct. Your final output needs to be convergent, consistent, and valid. How closely does the result match your stated business goals?

Understand how you validate documents and build the appropriate validators. For software, SAST and DAST fit into this category, but in other contexts you will use structure and syntax validators, spell checkers, grammar checkers, compilers and other tools.

Prefer deterministic measures over LLM-as-a-judge. You don't need creativity or interpretation - you need rigour.

### Choose your weapon

You can build a document processor on almost any eventing, workflow, or orchestration engine, from [Azure Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview) to [Kafka](https://kafka.apache.org/) through [Camunda](https://camunda.com/) to [GitHub workflows](https://docs.github.com/en/actions). I haven't found my favourite yet. What's important to know is that you're modelling how your documents are transformed and validated.

## Are you building a document processor?

If you're building or using a software factory, you are likely using or enhancing a document processor.  

If you're doing a significant amount of AI context engineering, you're probably chaining document processing units. You may have some document processing in a largely relational or ERP based system, and that's fine - there's no need to force it.

However, if, like me, you find yourself trying to trace lineage, gradually replacing AI logic with deterministic compiler-style logic, or chaining document versions together, you may find the document processor a useful metaphor.

Or maybe not. A workflow engine built as a document processor will waste time and cycles on versioning and reprocessing. Documents don't ledger particularly well. Perhaps it's just a wrapper around a database. There are plenty of them about.