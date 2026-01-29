import './App.css';
import BUTTONS from './Buttons.module.css';
import INDICATORS from './Indicators.module.css';
import React, { useEffect, useState } from 'react';
import { classifyExternality } from '../service/model';

export const STAR_CONFIG = {
    color: 'rgb(255,100,100)',
    min_size: 5,
    max_size: 40,
    n_stars_per_row: 16 // per row
}

function App() {
    const [requestQuery, SUReq] = useState({
        query: '',
        market_structure: '',
        industry: '',
    })
    const [gptRes, SURes] = useState({
        type: 'positive',
        demand: 'increase', // init no_impact
        supply: 'decrease',  // init no_impact
        effect_mag: 0,
    });

    const indBaseClass = INDICATORS['base'];

    const CURVES_MAP = {
        decrease: {
            class: 'negative',
            imgRoot: '/red-arrow.png'
        },
        increase: {
            class: 'positive',
            imgRoot: '/green-arrow.png'
        },
        no_impact: {
            class: 'no_effect',
            imgRoot: ''
        },
    }
    const demandKey = gptRes.demand as keyof typeof CURVES_MAP;
    const demandInd = CURVES_MAP[demandKey];
    const supplyKey = gptRes.supply as keyof typeof CURVES_MAP;
    const supplyInd = CURVES_MAP[supplyKey];
    const magnitude = gptRes.effect_mag.toFixed(2);

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
            console.log(parsed);
            SURes(parsed);
        } else {
            alert('Fill in all fields');
        }
    }

    return (
        <React.Fragment>
            <div className='side-content'>
                <div className="form">
                    <label htmlFor="externalityQuery">externality</label>
                    <input
                        id='externalityQuery'
                        type='text' 
                        placeholder='i.e air pollution' 
                        value={requestQuery.query} 
                        onChange={(e) => {SUReq(prev => ({...prev, query: e.target.value}))}} />
                    <label htmlFor="marketStructureQuery">market structure</label>
                    <input
                        id='marketStructureQuery'
                        type='text' 
                        placeholder='i.e monopoly / perfect competition' 
                        value={requestQuery.market_structure} 
                        onChange={(e) => {SUReq(prev => ({...prev, market_structure: e.target.value}))}} />
                    <label htmlFor="industryQuery">industry</label>
                    <input
                        id='industryQuery'
                        type='text' 
                        placeholder='i.e automotive / energy' 
                        value={requestQuery.industry} 
                        onChange={(e) => {SUReq(prev => ({...prev, industry: e.target.value}))}} />

                    <div className="form-actions">
                        <button className={BUTTONS.secondary} onClick={() => {
                            SUReq({query: 'air pollution', market_structure: 'monopoly', industry: 'energy'});
                            // send
                        }}>autofill</button>
                        <button className={BUTTONS.primary} onClick={send}>try</button>
                    </div>
                </div>
                <div className='direct-response'>
                    <div>
                        <p>Externality type: {gptRes.type}</p>
                        <div className={`${indBaseClass} ${INDICATORS[gptRes.type+'_t']}`}>
                            {
                                gptRes.type.length > 0 ? (
                                    gptRes.type === 'no_effect' ? ('') : (
                                        gptRes.type === 'positive' ? (<p>+</p>) : (<p>–</p>)
                                    )
                                ) : ('')
                            }
                        </div>
                    </div>
                    <div>
                        <p>Demand: {gptRes.demand}</p>
                        <div className={`${indBaseClass}`}>
                            {
                                demandInd.class.length > 0 ? (
                                    demandInd.class === 'no_effect' ? ('') : (<img src={demandInd.imgRoot} />)
                                ) : ('')
                            }
                        </div>
                    </div>
                    <div>
                        <p>Supply: {gptRes.supply}</p>
                        <div className={`${indBaseClass}`}>
                            {
                                supplyInd.class.length > 0 ? (
                                    supplyInd.class === 'no_effect' ? ('') : (<img src={supplyInd.imgRoot} />)
                                ) : ('')
                            }
                        </div>
                    </div>
                    <div>
                        <p>Effect magnitude:</p>
                        {
                            typeof gptRes.effect_mag === "number" ? (
                                gptRes.effect_mag === 0 ? (
                                    <div style={{color: gptRes.effect_mag > 0 ? 'red' : 'var(--theme-positive-color)'}}>
                                        <p>±{magnitude}</p>
                                    </div>
                                ) : (
                                    gptRes.effect_mag > 0 ? (<p>+{magnitude}</p>) : (<p>{magnitude}</p>)
                                )
                            ) : (<p></p>)
                        }
                    </div>
                </div>
            </div>

            {/* <div className="main-content">
            </div> */}
        </React.Fragment>
    )
}

export default App;
