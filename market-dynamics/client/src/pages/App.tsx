import './App.css';
import BUTTONS from './Buttons.module.css';
import INDICATORS from './Indicators.module.css';
import React, { useEffect, useState, type ChangeEvent } from 'react';
import { classifyExternality } from '../service/dispatchRunInference';
import Loader from '../components/loader/loader';
import IconButton from '../components/icon-button/icon-button';
import { createObjectBoundaries, stars } from '../core/starField';

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
            imgRoot: '/icons/call_red.svg'
        },
        increase: {
            class: 'positive',
            imgRoot: '/icons/call_green.svg'
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

    // function registerBoundingField(element: HTMLElement) {}

    function pinSingleCellElements(elementsList: NodeListOf<HTMLButtonElement>) {
        
        elementsList.forEach(element => {
            // let count;

            // if (element.dataset.fromtop) {

            // }
            // for (let s = 0; s < stars.length; s++) {}

            const rect = element.getBoundingClientRect();
            const starId = Number(element.dataset.pinto);
    
            const bs = stars[starId];
            const bx = bs.x - rect.width/2;
            const by = bs.y - rect.height/2;
    
            element.style.setProperty('--pos-y', `${by}px`);
            element.style.setProperty('--pos-x', `${bx}px`);

            createObjectBoundaries(element, element.name, true);
        })
    }

    function bindMultiCellElements(element: HTMLDivElement) {
        const rect = element.getBoundingClientRect();
        const starId = Number(element.dataset.pinto);

        const es = stars[starId];
        const ex = es.x - es.boundingBoxSize/2;
        const ey = es.y - rect.height/2;
        const w = es.boundingBoxSize * Number(element.dataset.width);

        element.style.setProperty('--pos-y', `${ey}px`);
        element.style.setProperty('--pos-x', `${ex}px`);
        element.style.setProperty('--width', `${w}px`);

        element.dataset.name ? (
            createObjectBoundaries(element, element.dataset.name, true)
        ) : (
            createObjectBoundaries(element, element.toString(), true)
        )
    }
    
    useEffect(() => {
        const userColorScheme = localStorage.getItem('colorScheme') as 'light' | 'auto' | 'dark';
        if (userColorScheme) setColorScheme(userColorScheme);

        const buttons = document.querySelectorAll<HTMLButtonElement>('.single-cell-with-boundaries');
        pinSingleCellElements(buttons);
    }, []);
    
    function invokeSettingsUI(ui: string) {
        const settingUI = document.querySelector(`.${ui}`) as HTMLDivElement;
        settingUI.classList.toggle('closed-s-ui');
        bindMultiCellElements(settingUI);
    }

    function setColorScheme(mode: 'light' | 'dark' | 'auto') {
        const root = document.documentElement;
        const button = document.getElementById(`${mode}Mode`);

        document.querySelectorAll('.mode-switch').forEach(sw => {
            sw.classList.remove('selected');
        });

        if (mode === 'auto') {
            root.removeAttribute('data-theme');
            root.style.setProperty('color-scheme', 'auto light dark');
        } else {
            root.setAttribute('data-theme', mode);
            root.style.setProperty('color-scheme', mode);
        }

        button?.classList.add('selected');
        localStorage.setItem('colorScheme', mode);
    }

    return (
        <React.Fragment>
            <IconButton
                className='single-cell-with-boundaries star-magnifier-modifier-btn'
                name='srMagnifierBtn'
                data-pinto='122'
                root='./icons/flare.svg'
                onClick={() => invokeSettingsUI('star-magnifier-setting')} />
                
            <div className='setting-ui star-magnifier-setting closed-s-ui' data-name='settinUI' data-pinto='114' data-width='7'>
                <input type="number" placeholder='oh' />
                <input type="number" placeholder='oh' />
                <input type="number" placeholder='oh' />
            </div>

            <IconButton
                className='single-cell-with-boundaries color-scheme-switch-btn'
                name='colSchemeBtn'
                data-pinto='124'
                // data-fromtop='1'
                // data-frombottom=''
                // data-fromleft=''
                // data-fromright='1'
                root='./icons/settings_color_scheme.svg'
                onClick={() => invokeSettingsUI('color-scheme-setting')} />

            <div className='setting-ui color-scheme-setting closed-s-ui' data-name='settingUI' data-pinto='118' data-width='5'>
                <IconButton
                    id='lightMode'
                    className='mode-switch'
                    root='/icons/light_mode.svg'
                    onClick={() => setColorScheme('light')} />
                <IconButton
                    id='autoMode'
                    className='mode-switch'
                    root='/icons/auto_dark_mode.svg'
                    onClick={() => setColorScheme('auto')} />
                <IconButton
                    id='darkMode'
                    className='mode-switch'
                    root='/icons/dark_mode.svg'
                    onClick={() => setColorScheme('dark')} />
            </div>

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
