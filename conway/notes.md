
# A Dynamic Cellular-Automaton Board Game
## Concept document and development brief — Version 0.1

## 1. The central idea

Create a software-based board game inspired by Conway's Game of Life, in which players influence a living, changing ecosystem by modifying the rules that govern it.

The board consists of cells. Cells can live, die, reproduce, and potentially produce resources. The behavior of the ecosystem depends on simple local rules and on which cells are neighbors.

Players do not merely react to a fixed environment. They can change some of the rules during the game, influencing how the ecosystem develops.

The longer-term idea is to give each player a pet that needs food. Players must keep their pets alive while experimenting with the rules of the ecosystem that supplies the food.

The game should combine:

- The fascination of watching a cellular automaton evolve.
- The strategic consequences of changing a few simple rules.
- A dynamic board whose geometry and topology can vary.
- A concrete objective, such as keeping a pet alive.
- Emergent complexity rather than a large collection of predefined rules.

**Design principle:** The game should be easy to understand, but its behavior should be interesting enough that players cannot predict everything that will happen.

## 2. The inspiration: Conway's Game of Life

Conway's Game of Life is the principal inspiration for the ecosystem.

Its appeal comes from the fact that very simple rules can generate surprisingly complex behavior. Cells interact locally, but their interactions can produce large-scale patterns and unpredictable developments.

We want to retain that quality while introducing player agency.

Possible characteristics:

- Cells have a small number of states, initially just alive or dead.
- A cell's next state depends on its current state and its living neighbors.
- The ecosystem advances in discrete generations.
- Players can alter one or more parameters of the propagation rules.
- Different rule settings can produce different patterns and rates of growth or extinction.
- The visual display makes the consequences of each rule change immediately apparent.

We do not need to reproduce Conway's exact rules. They are a starting point, not a restriction.

## 3. The board: Tessagon and topology

An important technical and creative asset is the existing Tessagon library.

The board should be generated in software rather than constructed from physical tiles or tokens. This makes it possible to experiment with different geometries and neighbor relationships without the overhead of physical components.

The board has two distinct aspects:

**Geometry:** How cells are arranged and displayed.

**Topology:** Which cells are considered neighbors for purposes of the ecosystem rules.

These aspects should be separated. Two boards may look different but use similar neighbor relationships, or look similar while having different neighbor relationships.

Potential future experiments include:

- Conventional square grids.
- Hexagonal grids.
- Triangular or other polygonal arrangements.
- Periodic or repeating tilings.
- Different Tessagon-generated patterns.
- Alternative boundary conditions, such as edges, wrapping, or connections between selected boundaries.
- Different neighborhood definitions, such as edge-sharing cells versus a broader neighborhood.

These are possibilities for experimentation, not requirements for the first version.

The main opportunity is that the board's topology itself could change the behavior of the ecosystem. A rule that produces one kind of pattern on a square grid might behave differently on another topology.

For the initial prototype, use one simple board configuration. The architecture should make changing the topology possible later.

## 4. The ecosystem

The ecosystem is the simulation that runs on the board.

Initially, it should be deliberately small.

### Initial cell model

Each cell has an alive/dead state.

At each generation, the simulation examines the current board and calculates the next state of every cell according to the propagation rule.

The next generation should be calculated from the complete previous generation, rather than updating cells one by one in place. This ensures that the result does not depend on the order in which cells are processed.

### Rule modification

Players can change a simple numerical parameter that affects propagation.

For example, a rule might specify that a dead cell becomes alive when it has exactly a certain number of living neighbors. The initial experiment could use a fixed birth threshold or a small set of configurable parameters.

The exact rule and permitted values are still to be decided.

The important idea is that changing a small number can change the evolution of the entire ecosystem.

### Resources

Living cells may produce food or another resource.

For the simplest implementation, resource production can be a straightforward function of the number of living cells. We do not initially need different resources, complicated production chains, or individual cell inventories.

A later version could associate resource production with particular cells, patterns, or cell states.

### Emergence

The aim is not to script specific outcomes. Interesting behavior should arise from the interaction between:

- The propagation rules.
- The board's topology.
- The initial distribution of living cells.
- The players' rule modifications.
- Eventually, resource requirements and other game mechanics.

The simulation should remain understandable even when its long-term behavior becomes difficult to predict.

## 5. The game idea: pets and survival

The first game mechanic proposed is that each player has a pet that needs food.

The pet gives the ecosystem a purpose: players are not changing rules merely to create interesting patterns; they are trying to sustain something they care about.

### Basic concept

- Each player has one pet.
- A pet needs a specified quantity of food each round.
- Food is produced by the ecosystem.
- Players modify the ecosystem rules to influence food availability.
- If a pet cannot be fed, it loses health or life.
- The objective is to keep the pet alive.

The initial version should use one generic food resource. All pets can eat the same food.

Pets do not initially need individual personalities, abilities, movement, or complicated biological requirements.

### Possible win conditions

Several alternatives could be tested later:

1. **Last pet standing:** The winner is the player whose pet survives longest.
2. **Fixed-duration survival:** After a predetermined number of rounds, the healthiest pet wins.
3. **Survival contract:** A player must keep their pet alive for a specified duration.
4. **Resource target:** A player wins by keeping a pet alive while accumulating or delivering a target quantity of food.

The fixed-duration survival model is a useful initial candidate because it gives the game a clear ending without requiring an elaborate scoring system.

The exact victory condition has not yet been finalized.

## 6. Player interaction and strategy

The distinctive mechanic is that players can modify the rules governing the ecosystem while playing.

A possible turn structure is:

1. A player changes one permitted rule parameter or passes.
2. Other players take their turns.
3. The ecosystem advances one generation.
4. Food production is calculated.
5. Players feed their pets.
6. Pets that cannot be fed lose health.
7. The next round begins.

This is a candidate structure, not a final specification.

The most important unresolved design question is how rule changes should work in a multiplayer game.

For example:

- Can every player change the same parameter?
- Does the most recent change replace the previous value?
- Can players undo or counteract another player's change?
- Are there costs or limits on rule changes?
- Do players have individual influence over different parts of the ecosystem?

For the first playable prototype, avoid complicated ownership systems or action currencies. Test whether changing a rule and observing the consequences is interesting in itself.

A central source of strategic tension could be that a player changes a rule to improve food production for their own pet, but the change also affects everyone else's prospects.

Whether this tension is enjoyable will need to be discovered through experimentation.

## 7. Complexity and recursion

We explicitly want to avoid making the game too complicated too early.

The ecosystem may exhibit feedback loops: more living cells may mean more food, which makes survival easier, while different propagation rules can eventually cause food production to collapse.

Such feedback does not require recursive program logic.

For the initial implementation, the simulation can proceed in discrete steps:

- Read the current cell states.
- Calculate the next generation.
- Calculate the available resources.
- Update the pets' health.
- Repeat.

Each step uses the results of the previous step.

This is sufficient to produce dynamic and potentially surprising behavior. There is no need to introduce recursive rules, nested ecosystems, or entities that create other entities.

The distinction is important: **the game can have emergent complexity without having complicated implementation logic.**

Future mechanics should be added only when they create a genuinely interesting decision or observable behavior.

## 8. Software architecture

The implementation should separate the major responsibilities so that the game can evolve without requiring a rewrite.

### A. Board and topology

Responsibilities:

- Generate the board geometry using Tessagon.
- Represent cells consistently.
- Provide each cell's neighbor relationships.
- Support alternative topologies in the future.

### B. Ecosystem simulation

Responsibilities:

- Store cell states.
- Apply propagation rules.
- Calculate the next generation.
- Keep simulation logic independent of the visual display.

### C. Resource production

Responsibilities:

- Calculate how much food the ecosystem produces.
- Initially, use a simple aggregate count or similarly uncomplicated calculation.
- Keep the resource model separate from cell propagation.

### D. Game state

Responsibilities:

- Track players and pets.
- Track the current round.
- Apply player actions.
- Distribute food and update pet health.
- Check for a winner.

### E. Visualization and interaction

Responsibilities:

- Display the board.
- Make living and dead cells visually distinct.
- Animate or otherwise show successive generations.
- Let players modify permitted rule parameters.
- Show food availability and pet status once those mechanics are introduced.

The visualization is important because watching the ecosystem evolve is part of the appeal of the game, not merely a way to display numerical results.

## 9. Proposed development stages

### Stage 1 — A living board

Build the smallest useful experiment:

- One Tessagon-generated board.
- Living and dead cells.
- One propagation rule.
- A way to advance generations.
- A visual display of the results.

No pets, food, contracts, or multiplayer mechanics are needed yet.

The purpose is to discover whether the evolving patterns are visually interesting and whether changing the rule produces meaningful differences.

### Stage 2 — Interactive rule changes

Allow a player to change one numerical rule parameter and observe how the ecosystem responds.

Make it easy to compare different settings and restart experiments.

The goal is to test the central mechanic before introducing the rest of the game.

### Stage 3 — Food production

Introduce a simple relationship between living cells and food.

Display the available food and see whether changes in the ecosystem create useful variation in supply.

### Stage 4 — One pet and survival

Add the smallest possible pet model:

- One food requirement per round.
- A simple health or life counter.
- A clear consequence when food is insufficient.

At this stage, a single-player survival challenge may be enough to test whether the mechanic works.

### Stage 5 — Multiplayer

Introduce multiple players, their pets, turns, and a win condition.

Test whether players can meaningfully influence one another through rule changes.

### Stage 6 — Alternative boards and expansions

Experiment with alternative Tessagon topologies, additional rules, and optional game mechanics.

Do not assume that every possible expansion is necessary. Retain only those that improve the experience.

## 10. Possible future expansions

These are a collection of ideas to preserve for later. They are not part of the initial scope.

### A. More sophisticated pets

Pets might eventually differ in their food requirements or survival characteristics.

Examples:

- Different quantities of food required.
- Different levels of tolerance for hunger.
- Different preferences for resources.
- Different abilities to survive environmental changes.

The simplest extension would be to give pets different food requirements while keeping food itself identical.

### B. Pets interacting with the ecosystem

An early idea was that pets could interact with the ecological environment rather than simply consuming food from an abstract pool.

Possible examples:

- Pets occupy or move between cells.
- Pets consume resources produced in particular locations.
- Pets affect the state of cells they occupy.
- Pets influence local reproduction or resource production.

This could make the board feel more like a living environment, but it introduces many additional interactions. It should be postponed until the basic ecosystem and survival game are enjoyable.

### C. Multiple resources

The ecosystem might eventually produce several kinds of resources.

Pets could have different dietary needs, or players could be required to fulfill particular contracts.

However, multiple resources create additional questions about production, distribution, shortages, and trade. Start with one generic food resource.

### D. Contracts and objectives

The pet-survival idea could be extended into a contract system.

Potential contracts:

- Keep a pet alive for a certain number of rounds.
- Maintain a minimum food supply.
- Survive a period of ecological instability.
- Achieve a target level of food production.
- Keep a pet alive while another environmental condition is met.

Contracts could provide different goals to different players, but they should not be introduced until the basic survival objective works.

### E. Player-controlled ecosystem rules

The rule-modification mechanic could eventually become more expressive.

Possibilities include:

- Several adjustable parameters.
- A limited budget for rule changes.
- Different rule-changing powers for different players.
- Temporary rules that last for a fixed number of generations.
- Rules that interact with particular cell types.
- Players proposing changes that affect the entire board.

These should be explored one at a time. A small number of meaningful choices is preferable to a large rule editor that is difficult to understand.

### F. More complex cell states

The initial alive/dead model might eventually expand to include different cell types or stages.

For example, cells might have different resource-producing properties, or a cell could change state after producing food.

Such additions should be motivated by gameplay rather than by the desire to simulate a biologically realistic ecosystem.

### G. Ecosystem feedback and food chains

Living cells could eventually depend on resources, or different organisms could interact.

This could generate more complex feedback loops, including population booms, collapses, and competition.

It is potentially interesting but also one of the largest sources of complexity. It is not needed to test the original idea.

### H. Topology as a strategic variable

The Tessagon library offers a particularly interesting future direction.

Different board topologies might create different ecological conditions. Players could potentially select a topology, alter boundary conditions, or influence which cells are connected.

A topology change could be a strategic action, a scenario setting, or a special event.

This should be explored only after the basic simulation works reliably across at least one board.

### I. Scenarios and challenges

Once the simulation is stable, the software could support different starting configurations and challenges.

Examples:

- Start with very few living cells.
- Survive a period of low food production.
- Keep a pet alive while the ecosystem changes dramatically.
- Find a rule setting that sustains a stable population.
- Compare the same rules across different topologies.

These scenarios could provide variety without requiring a large number of new mechanics.

### J. Emergent visual patterns

The evolving board itself could become a source of discovery.

The software might eventually let players save interesting states, compare rule settings, replay an evolution, or observe how small changes lead to different outcomes.

These are supporting features rather than requirements for the first prototype.

## 11. Design principles to preserve

1. **Keep the first version tiny.** A working experiment is more valuable than a comprehensive design that has not been tested.
2. **Let simple rules produce complexity.** Prefer interesting interactions over many special cases.
3. **Keep geometry and topology separate from game rules.** Tessagon should make experimentation easier, not entangle the whole implementation.
4. **Separate simulation from visualization.** The same ecosystem logic should be usable with different boards and displays.
5. **Avoid unnecessary recursion.** Ordinary step-by-step simulation is sufficient.
6. **Introduce one mechanic at a time.** Test it before adding another.
7. **Make the consequences visible.** Players should be able to see what their rule changes do.
8. **Do not simulate biology for its own sake.** Realism is optional; interesting decisions are essential.
9. **Keep future possibilities without implementing them prematurely.** A feature belongs on the future-ideas list until it proves its value.
10. **Discover the game through experiments.** The rules and objectives can evolve as we learn what is enjoyable.

## 12. Open questions

These questions should remain open until experiments provide useful evidence.

- Which initial propagation rule is most interesting?
- Which rule parameters should players be able to change?
- Does changing a rule produce enough strategic tension on its own?
- How much unpredictability is enjoyable rather than frustrating?
- Should the first playable game be single-player or multiplayer?
- Should players modify a shared rule or have different ways to influence the ecosystem?
- How should food production relate to living cells?
- Should a pet lose health immediately when unfed, or have a small reserve?
- What is the simplest satisfying victory condition?
- Which Tessagon topology provides the best initial experiment?
- How much animation and visual detail is necessary to make the ecosystem engaging?

There is no need to answer all these questions before writing software.

## 13. Handoff instructions for Codex

The next development conversation should begin by treating this document as the conceptual specification, not as a request to implement every feature.

Before making changes, inspect the existing project and Tessagon library to understand the current structure, interfaces, and constraints. Reuse the existing code where appropriate rather than rebuilding it unnecessarily.

Then proceed incrementally:

1. Identify the smallest existing code path that can generate and display a board.
2. Determine how cells and neighbor relationships are represented.
3. Implement or adapt a minimal alive/dead simulation.
4. Add a way to advance one generation at a time.
5. Add one adjustable rule parameter.
6. Verify the behavior on a small board before adding more mechanics.

Do not start with pets, contracts, multiple resources, or complicated game rules.

Keep each change small enough to test and understand. Avoid unnecessary dependencies and large architectural rewrites.

The first milestone is simply this:

**Generate a Tessagon board, initialize living and dead cells, advance the ecosystem by one generation, and display the result. Then allow the rule to be changed and observe what happens.**

Once this experiment is working and interesting, the next design decisions can be based on what we actually observe.

---

## Current status

**Established direction:** A software-based, dynamic cellular-automaton game using Tessagon, with player-modifiable rules and a possible pet-survival objective.

**First prototype:** Board, cell states, one propagation rule, generation updates, and visualization.

**Long-term possibility:** A strategy game in which players influence an evolving ecosystem to maintain resources and fulfill survival objectives.

**Not yet decided:** Exact rules, multiplayer structure, resource mechanics, pet behavior, and victory conditions.

The guiding question for the first experiment is:

*Is it fun to change a simple rule, watch an ecosystem evolve, and discover the consequences?*

Everything else can wait until we know the answer.


