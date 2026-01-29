import './App.css';
import BUTTONS from './Buttons.module.css';
import INDICATORS from './Indicators.module.css';
import React, { useState } from 'react';
import { classifyExternality } from '../service/model';
import Loader from '../components/loader';

function App() {
    const [requestQuery, SUReq] = useState({
        query: '',
        market_structure: '',
        industry: '',
    })
    const [gptRes, SURes] = useState({
        type: 'no_effect', // init no_effect
        demand: 'no_impact', // init no_impact
        supply: 'no_impact',  // init no_impact
        effect_mag: '', // init ''
    });

    const [isLoading, setLoader] = useState(false);

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

    // if (typeof gptRes.effect_mag === 'number') {
    // }
    const magnitude = gptRes.effect_mag;

    async function sendOnClick() {
        let count = 0;
        Object.values(requestQuery).forEach((val: any) => {
            if (val.length === 0) count++;
        })
        
        if (count === 0) {
            // setLoader(true);
            const res = await classifyExternality(
                requestQuery.query, 
                requestQuery.market_structure, 
                requestQuery.industry
            );
            const cleaned = res.replace(/```json\s*/i, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            console.log(parsed);
            SURes(parsed);
            // setLoader(false);
        } else {
            alert('Fill in all fields');
        }
    }
    function autoFill() {
        SUReq({query: 'pandemic', market_structure: 'monopolistic competition', industry: 'any'});
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
                        <button className={BUTTONS.secondary} onClick={autoFill}>autofill</button>
                        <button className={BUTTONS.primary} onClick={sendOnClick}>try</button>
                    </div>
                </div>
                {
                    !isLoading ? (
                        <div className='direct-response'>
                            <div>
                                <p>Externality type: {gptRes.type.replace('_',' ')}</p>
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
                                <p>Demand: {gptRes.demand.replace('_',' ')}</p>
                                <div className={`${indBaseClass}`}>
                                    {
                                        demandInd.class.length > 0 ? (
                                            demandInd.class === 'no_effect' ? ('') : (<img src={demandInd.imgRoot} />)
                                        ) : ('')
                                    }
                                </div>
                            </div>
                            <div>
                                <p>Supply: {gptRes.supply.replace('_',' ')}</p>
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
                                            <div style={{color: 'var(--theme-positive-color)'}}>
                                                <p>+{magnitude}</p>
                                            </div>
                                        ) : (
                                            gptRes.effect_mag > 0 ? (
                                                <div style={{color: 'var(--theme-positive-color)'}}>
                                                    <p>+{magnitude}</p>
                                                </div>
                                            ) : (
                                                <div style={{color: 'var(--theme-negative-color)'}}>
                                                    <p>{magnitude}</p>
                                                </div>
                                            )
                                        )
                                    ) : ('')
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="direct-response">
                            <Loader />
                        </div>
                    )
                }
            </div>

            <div className="main-content">
            </div>
        </React.Fragment>
    )
}

export default App;
