// knowledge_base.ts

// The detailed context about Oligopolies (your Knowledge Base)
export const DETAILED_CONTEXT = `
### Oligopoly Market Structure

1. **Definition and Meaning**
Literal Meaning: The term "oligopoly" comes from the Greek word oligos (meaning few), literally translating to "competition among the few."
Behavior over Structure: While it is structurally defined as a market containing a few firms, economists prefer to define it by **market conduct (behavior)**.
Key Characteristics:
* **Interdependence:** This is the defining feature. Firms must take into account the likely reactions of their rivals when making decisions about price or output. Game theory is particularly useful for mapping this interdependence in detail.
* **Uncertainty:** Because of interdependence, a firm can never be completely certain how rivals will react to its strategic moves.

2. **Measuring Market Structure**
To objectively identify an oligopoly, economists use **Concentration Ratios**, which measure the market share of the largest firms in an industry.
Calculation: A "five-firm concentration ratio" adds up the market percentage of the five largest firms.
Examples:
* UK Banking: In 2021, the six largest banks had a five-firm concentration ratio of 94%.
* Web Browsers: The European market is highly concentrated, with a four-firm ratio of over 91% (Chrome, Safari, Firefox, Edge).

3. **Theoretical Models of Behavior**
Two primary models explain how oligopolies behave, specifically regarding price stability and strategy.

A. **The Kinked Demand Curve:**
Purpose: This model explains **price rigidity**—why prices tend to stay stable even when costs change.
The Theory:
* If a firm raises its price, it assumes rivals will not follow. The firm loses market share, meaning demand is **elastic** (sensitive to price).
* If a firm cuts its price, it assumes rivals will match the cut to avoid losing customers. The firm gains very few sales, meaning demand is **inelastic** (insensitive to price).
* The "Kink": These differing assumptions create a "kink" in the demand curve at the current price. This causes a vertical gap in the **Marginal Revenue (MR) curve**, meaning **Marginal Costs (MC)** can fluctuate without changing the optimal price.

B. **Game Theory (The Prisoner's Dilemma):** Purpose: This provides a more detailed analysis of strategic interdependence than the kinked demand curve.
The Scenario: Imagine two firms (Firm A and Firm B) deciding between a High Price (£1) and a Low Price (90p).
* **Best Joint Outcome:** Both charge High Price (e.g., £3m each).
* **Dominant Strategy:** To avoid the "worst-case" scenario of being undercut, the rational choice for both firms is to charge the Low Price.
* **Nash Equilibrium:** Both firms end up charging the Low Price. This creates a stable equilibrium (price rigidity) where neither has an incentive to change, even though they make less profit than if they had colluded.

4. **Strategic Behavior: Competition vs. Collusion**
Firms constantly balance the urge to compete against the temptation to collude.

* **Competitive (Non-Collusive) Oligopoly:** Firms act independently. Prices often stay stable (Price Rigidity), leading to **Non-Price Competition** (branding, advertising, service, and product quality).
* **Collusive Oligopoly:** Firms cooperate to reduce uncertainty and maximize joint profits, effectively acting like a monopoly.
    * **Cartels:** A formal agreement (often illegal) to fix prices or restrict output. They aim for Joint-Profit Maximization, setting industry output where industry **Marginal Revenue** equals **Marginal Cost**.
    * **The Incentive to Cheat:** Game theory shows that collusion is unstable. Every member has a strong financial incentive to secretly undercut the others (cheat) to steal market share and boost profit.

5. **Pricing Strategies**
* **Price Leadership:** A form of tacit collusion where a dominant firm sets the price and smaller firms follow.
* **Price Wars:** Firms continuously cut prices to undercut rivals, which benefits consumers short-term but can lead to less competition later.
* **Price Discrimination:** Charging different prices to different consumers for the same product based on willingness to pay.

6. **Advantages and Disadvantages**
* **Advantages:** Economies of Scale, Innovation (dynamic efficiency), and simplicity in consumer choices.
* **Disadvantages:** High Prices (due to collusion), Inefficiency (cartels protect weak firms), and high **Barriers to Entry** for new competitors.

7. **Real-World Applications**
* Supermarkets: "Hard discounters" (Aldi, Lidl) compete on low costs, making it hard for traditional giants (Tesco) to compete purely on price.
* Book Market: The shift from fixed prices (Retail Price Maintenance) to aggressive discounting by giants (Amazon) has forced many small independent bookshops to close.
* Regulation: Some countries ban heavy discounting (e.g., France on books) to protect small shops.
`;

// The system instruction for the model's persona and rules
export const SYSTEM_INSTRUCTION = `
# YOUR ROLE: Specialized Economics Tutor
You are a strict and focused Economics Tutor specializing in the Oligopoly Market Structure.
Your goal is to teach the user using *only* the knowledge provided in the "KNOWLEDGE BASE" section.

## CORE DIRECTIVES
1. **SOURCE OF TRUTH:** You must ONLY use the "KNOWLEDGE BASE" provided below to answer questions. Do not use external knowledge about other economic topics or general world knowledge.
2. **STRICTLY ON-TOPIC:** You must refuse to answer any question that is not related to Oligopolies or the provided text.
3. **TEACHER PERSONA:** Explain concepts clearly using the definitions provided. Use headings and bullet points for readability.

## BEHAVIORAL RULES
* **Refusal:** If the user asks an off-topic question (e.g., "What is the capital of France?", "Write me a poem", "What is Perfect Competition?"), you MUST politely refuse.
    * *Refusal Example:* "I am specialized only in the Oligopoly market structure and must stick to the curriculum provided. I cannot assist with other topics. Let's discuss Kinked Demand Curves or Game Theory instead."
`;