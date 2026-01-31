import './App.css';
import BUTTONS from './Buttons.module.css';
import INDICATORS from './Indicators.module.css';
import React, { useState, type ChangeEvent } from 'react';
import { classifyExternality } from '../service/model';
import Loader from '../components/loader';

function App() {
    const [requestQuery, SUReq] = useState({
        query: '',
        market_structure: '',
        industry: '',
    })
    const [gptRes, SURes] = useState({
        type: 'no_effect',
        demand: 'no_impact',
        supply: 'no_impact',
        effect_mag: '',
    });

    const [isLoading, setLoader] = useState(false);
    const [disabledBtns, disableBtn] = useState({
        autoFillBtn: '',
        sendBtn: '',
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
    const magnitude = gptRes.effect_mag;

    const [requestQueryCopy, SUReqCopy] = useState(requestQuery);

    const autoFillQuery = {
        query: 'pandemic',
        market_structure: 'monopolistic competition',
        industry: 'any'
    }

    function reInit() {
        setLoader(false);
        SUReq({query: '', market_structure: '', industry: ''});
        disableBtn({autoFillBtn: '', sendBtn: ''});
    }

    function reqOnChange(e: ChangeEvent, param: string) {
        const newRequestQuery = {...requestQuery, [param]: (e.target as HTMLInputElement).value};
        SUReq(newRequestQuery);
        
        !!Object.values(newRequestQuery).some(i => i.length === 0) ? disableBtn({...disabledBtns, autoFillBtn: ''}) : ('');
    }
    
    async function dispatchRunInference() {
        if (
            !Object.values(requestQuery).some(val => val.length === 0)
        ) {
            setLoader(true);
            disableBtn({...disabledBtns, sendBtn: 'disabled'});
            SUReqCopy(requestQuery);
            
            const res = await classifyExternality(
                requestQuery.query, 
                requestQuery.market_structure, 
                requestQuery.industry
            );
            const cleaned = res.replace(/```json\s*/i, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            SURes(parsed);

            reInit();
        } else {
            alert('Fill in all fields');
        }
    }

    function autoFill() {
        if (
            Object.values(requestQuery).every(val => val.length === 0)
        ) {
            SUReq(autoFillQuery);
        } else {
            let temp = {...requestQuery};
            Object.entries(requestQuery).forEach(([key, val]) => {
                if (val.length === 0) {
                    temp = {...temp, [key]: autoFillQuery[key as keyof typeof autoFillQuery]};
                }
            })
            SUReq(temp);
        }


        disableBtn(prev => ({...prev, autoFillBtn: 'disabled'}))
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
                        onChange={(e) => {reqOnChange(e, 'query')}} />
                    <label htmlFor="marketStructureQuery">market structure</label>
                    <input
                        id='marketStructureQuery'
                        type='text' 
                        placeholder='i.e monopoly / perfect competition' 
                        value={requestQuery.market_structure} 
                        onChange={(e) => {reqOnChange(e, 'market_structure')}} />
                    <label htmlFor="industryQuery">industry</label>
                    <input
                        id='industryQuery'
                        type='text' 
                        placeholder='i.e automotive / energy' 
                        value={requestQuery.industry} 
                        onChange={(e) => {reqOnChange(e, 'industry')}} />

                    <div className="form-actions">
                        <button className={`${BUTTONS.secondary} ${BUTTONS[disabledBtns.autoFillBtn]}`} onClick={autoFill}>autofill</button>
                        <button className={`${BUTTONS.primary} ${BUTTONS[disabledBtns.sendBtn]}`} onClick={dispatchRunInference}>apply</button>
                    </div>
                    <div className="direct-req-res">
                        <h2>last request</h2>
                        <div className="direct-req">
                            <div>
                                <p>Externality: {requestQueryCopy.query}</p>
                            </div>
                            <div>
                                <p>Market structure: {requestQueryCopy.market_structure}</p>
                            </div>
                            <div>
                                <p>Industry: {requestQueryCopy.industry}</p>
                            </div>
                        </div>

                        <h2>response</h2>
                        <div className="direct-res">
                            {
                                !isLoading ? (
                                    <React.Fragment>
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
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Loader />
                                    </React.Fragment>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="main-content"></div> */}
        </React.Fragment>
    )
}

export default App;
