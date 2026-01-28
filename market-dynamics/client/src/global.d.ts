interface Query {
    externalityQuery: string // maximum length 5 tokens
    market_structure: 'perfect competition' | 'monopolistic competition' | 'monopoly' | 'oligopoly'
    company_focus?: string
}
interface Response {
    extType: 'no_effect' | 'positive' | 'negative'
    effect: 'no_effect' | 'minor' | 'medium' | 'major' | 'catastrophic'
}
