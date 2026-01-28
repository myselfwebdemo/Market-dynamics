## Dictionary

```js
// x E1 ——> x is/are a subject of change
```

## Use Model

ChatGPT 4.1 nano  
### Cost: 
Per 1M tokens: ```$0.20```  
Per token: ```$0.0000002```  
Per word (approximately): ```$0.00000026```
### Assumption
We assume that average user input is 2 words and therefore of cost of ```$0.00000052```

## Interaction With Model

#### Query type:
```ts
interface Query {
    externalityQuery: string<length{"maximum 5 tokens"}>
    market_structure?: "perfect competition" | "monopolistic competition" | "monopoly" | "oligopoly"
    company_focus?: string
}
```

Example system input 
```
JSON:type:no_effect/positive/negative,effect:no_effect/minor/medium/major/catastrophic
Ext:air pollution
Mkt:monopoly
```

## Rules and Examples
#### Input: 
```js 
["carbon tax", "pandemic", "noise pollution", "R&D subsidies", "etc"]
```

Overall system prompt length ~40 tokens  
User input must consist of maximum 5 tokens  

#### Response type:
```ts
interface Response {
    type: "no_effect" | "positive" | "negative"
    effect: "no_effect" | "minor" | "medium" | "major" | "catastrophic" // Effect names E1
}
```
#### Effect map:
```js
const EFFECT_MAP = {
    no_effect: 0,
    minor: 0.5,
    medium: 1, // default
    major: 1.5,
    catastrophic: 2 // value E1
}
```
#### Example response:
```json 
{
    "extType": "negative",
    "effect": "major",
}
```
