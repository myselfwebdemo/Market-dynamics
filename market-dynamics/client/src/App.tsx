import { useState } from 'react';
import { classifyExternality } from './service/model';

function App() {
    const [gptRes, suRes] = useState({
        type: 'xxx',
        effect: 'xxx',
    });
    const [requestQuery, suRequest] = useState({
        query: '',
        market_structure: '',
        industry: '',
    })

    async function send() {
        let count = 0;
        Object.values(requestQuery).forEach((val: any) => {
            if (val.length === 0) count++;
        })

        if (count === 0) {
            const res = await classifyExternality(
                requestQuery.query, 
                requestQuery.market_structure, 
                requestQuery.industry
            );
            const cleaned = res.replace(/```json\s*/i, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            suRes(parsed);
        } else {
            alert('Fill in all fields');
        }
    }

    return (
        <div className=''>
            <label htmlFor="externalityQuery">externality</label>
            <input 
                id='externalityQuery'
                type='text' 
                placeholder='I.e air pollution...' 
                value={requestQuery.query} 
                onChange={(e) => {suRequest(prev => ({...prev, query: e.target.value}))}} />
            <label htmlFor="marketStructureQuery">market structure</label>
            <input 
                id='marketStructureQuery'
                type='text' 
                placeholder='Monopoly / oligopoly / perfect competition / monopolistic competition' 
                value={requestQuery.market_structure} 
                onChange={(e) => {suRequest(prev => ({...prev, market_structure: e.target.value}))}} />
            <label htmlFor="industryQuery">industry</label>
            <input 
                id='industryQuery'
                type='text' 
                placeholder='I.e automotive / energy...' 
                value={requestQuery.industry} 
                onChange={(e) => {suRequest(prev => ({...prev, industry: e.target.value}))}} />
            <button onClick={send}>Send request</button>
            <h2>Externality type: {gptRes.type}</h2>
            <h2>Effect magnitude: {gptRes.effect}</h2>
        </div>
    )
}

export default App;
