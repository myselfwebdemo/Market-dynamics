import './App.css';
import BUTTONS from './Buttons.module.css';
import INDICATORS from './Indicators.module.css';
import React, { useEffect, useState, type ChangeEvent } from 'react';
import { classifyExternality } from '../service/dispatchRunInference';
import Loader from '../components/loader/loader';
import IconButton from '../components/icon-button/icon-button';
import { createObjectBoundaries, starMagnifier, stars, updateStarMagnifier } from '../core/starField';
import type Star from '../core/star';
import { STAR_CONFIG, STAR_MAGNIFIER } from '../config';

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

    // function registerBoundingField(element: HTMLElement, initIndex: number, tarRow: number, tarCol: number) {
    //     for (let i = initIndex; i < stars.length; i++) {}
    // }
    
    function isVisible(star: Star) {
        if (star.y > 0 && star.y < window.innerHeight) return true;
        return false;
    }

    function linkStarIndex(element: HTMLElement) {
        const nStarsPerRow = STAR_CONFIG.nStarsPerRow;
        let nRows = 0;

        for (const star of stars) {
            if (isVisible(star)) {
                if (star.index % nStarsPerRow === STAR_CONFIG.nStarsPerRow - 1) nRows++;
            }
        }

        let currentStar = 1;
        let rowOffset = 0;
        let pinToIndex = null;

        const edata = element.dataset as DOMStringMap;

        const fromTop = Number(edata.fromtop) || null;
        const fromBottom = Number(edata.frombottom);
        const fromLeft = Number(edata.fromleft) || null;
        const fromRight = Number(edata.fromright);
        const w = Number(edata.width) || null;
        const h = Number(edata.height) || null;

        if (!(fromTop || fromBottom || fromLeft || fromRight)) throw new Error(`No positional reference provided for ${(element as HTMLButtonElement).name || element.className}`)

        for (const star of stars) {
            if (isVisible(star)) {
                const tarRow = fromTop ?? (nRows - fromBottom - 1 - (h ? h-1 : 0));
                const tarCol = fromLeft ? (fromLeft + 1) : (nStarsPerRow - fromRight - (w ? w-1 : 0));
                const colIndex = currentStar;

                
                if (rowOffset === tarRow && colIndex === tarCol) {
                    pinToIndex = star.index;
                    // registerBoundingField(element, pinToIndex, tarRow, tarCol);
                    break
                }
                
                currentStar++;
                if (colIndex === nStarsPerRow) currentStar = 1;
                if (star.index % nStarsPerRow === nStarsPerRow - 1) rowOffset++;
            }
        }

        return pinToIndex!;
    }

    function pinSCE(element: HTMLButtonElement) {
        let pinToIndex = linkStarIndex(element);
    
        const rect = element.getBoundingClientRect();
        const bs = stars[pinToIndex!];
        const bx = bs.x - rect.width/2;
        const by = bs.y - rect.height/2;
    
        element.style.setProperty('--pos-y', `${by}px`);
        element.style.setProperty('--pos-x', `${bx}px`);
    
        createObjectBoundaries(element, element.name, true);
    }

    function pinSingleCellElements(formOfElement: NodeListOf<HTMLButtonElement> | HTMLButtonElement) {
        if (formOfElement instanceof NodeList) {
            formOfElement.forEach(element => {
                pinSCE(element);
            })
        } else pinSCE((formOfElement as HTMLButtonElement));
    }

    function bindMCE(element: HTMLDivElement) {
        const starId = linkStarIndex(element);
        const edata = element.dataset;
    
        const es = stars[starId];
        const ex = es.x - es.boundingBoxSize/2;
        const ey = es.y - es.boundingBoxSize/2;
        const w = es.boundingBoxSize * Number(edata.width);
        const h = edata.height ? es.boundingBoxSize * Number(edata.height) : es.boundingBoxSize
    
        element.style.setProperty('--pos-y', `${ey}px`);
        element.style.setProperty('--pos-x', `${ex}px`);
        element.style.setProperty('--width', `${w}px`);
        element.style.setProperty('--height', `${h}px`);

        edata.name ? (
            createObjectBoundaries(element, edata.name, true)
        ) : (
            createObjectBoundaries(element, edata.name!, true)
        )
    }

    function bindMultiCellElements(formOfElement: NodeListOf<HTMLDivElement> | HTMLDivElement) {
        if (formOfElement instanceof NodeList) {
            formOfElement.forEach(element => {
                bindMCE(element);
            });
        } else bindMCE((formOfElement as HTMLDivElement));
    }
    
    function invokeSettingsUI(ui: string) {
        const srMagnifierBtn = document.querySelector('.star-magnifier-modifier-btn') as HTMLButtonElement;
        const srMagnifierSettingWindow = document.querySelector('.star-magnifier-setting') as HTMLDivElement;

        if (ui === 'star-magnifier-setting') {
            srMagnifierSettingWindow.dataset.fromright = srMagnifierBtn.dataset.fromright === '9' ? '11' : '5';
        } else {
            srMagnifierSettingWindow.dataset.fromright = srMagnifierBtn.dataset.fromright === '9' ? '5': '11';
            srMagnifierBtn.dataset.fromright = srMagnifierBtn.dataset.fromright === '9' ? '3' : '9';
        }

        pinSingleCellElements(srMagnifierBtn);
        bindMultiCellElements(srMagnifierSettingWindow);
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

    const [starMagnifierState, SUStarMagnifier] = useState(starMagnifier);

    useEffect(() => {
        document.documentElement.style.setProperty('--grid-cell-width',`${stars[0].boundingBoxSize*1.5}px`);
        const userColorScheme = localStorage.getItem('colorScheme') as 'light' | 'auto' | 'dark';
        if (userColorScheme) setColorScheme(userColorScheme);

        const buttons = document.querySelectorAll<HTMLButtonElement>('.single-cell');
        pinSingleCellElements(buttons);

        const gridAnchorableEls = document.querySelectorAll<HTMLDivElement>('.grid-anchorable');
        bindMultiCellElements(gridAnchorableEls);
    }, []);

    localStorage.setItem('starMagnifierRadius', String(starMagnifierState.radius));
    localStorage.setItem('starMagnifierStrength', String(starMagnifierState.strength));
    localStorage.setItem('starMagnifierMaxSize', String(starMagnifierState.maxSize));
    Object.assign(starMagnifier, starMagnifierState)

    return (
        <React.Fragment>
            <IconButton
                className='single-cell star-magnifier-modifier-btn'
                name='srMagnifierBtn'
                data-fromtop='1'
                data-fromright='3'
                root='./icons/flare.svg'
                onClick={() => invokeSettingsUI('star-magnifier-setting')} />
                
            <div 
                className='grid-anchorable main-style setting-ui star-magnifier-setting closed-s-ui' 
                data-name='settinUI' data-fromtop='1' data-fromright='5' data-width='13'>
                <div>
                    <IconButton className='setting-ui-icon' root='/icons/radius.svg' />
                    <input 
                        type='number' 
                        id='smRadius' 
                        value={starMagnifierState.radius} 
                        onInput={(e) => {
                            const radius = Number((e.target as HTMLInputElement).value);

                            SUStarMagnifier(prev => {
                                const next = { ...prev, radius };
                                updateStarMagnifier({ radius });
                                return next;
                            });
                        }} />
                </div>
                <div>
                    <IconButton className='setting-ui-icon' root='/icons/concavity.svg' />
                    <input 
                        type='number' 
                        id='smStrength' 
                        value={starMagnifierState.strength} 
                        onInput={(e) => {
                            const strength = Number((e.target as HTMLInputElement).value);

                            SUStarMagnifier(prev => {
                                const next = { ...prev, strength };
                                updateStarMagnifier({ strength });
                                return next;
                            });
                        }} />
                </div>
                <div>
                    <IconButton className='setting-ui-icon' root='/icons/particle_scale.svg' />
                    <input 
                        type='number' 
                        id='smMaxSize' 
                        value={starMagnifierState.maxSize} 
                        onInput={(e) => {
                            const maxSize = Number((e.target as HTMLInputElement).value);

                            SUStarMagnifier(prev => {
                                const next = { ...prev, maxSize };
                                updateStarMagnifier({ maxSize });
                                return next;
                            });
                        }} />
                </div>
                <IconButton root='/icons/refresh.svg' onClick={() => {
                    SUStarMagnifier({
                        radius: STAR_MAGNIFIER.radius,
                        strength: STAR_MAGNIFIER.concavityFactor,
                        maxSize: STAR_MAGNIFIER.sizeFactor
                    });
                }} />
            </div>

            <IconButton
                className='single-cell color-scheme-switch-btn'
                name='colSchemeBtn'
                data-fromtop='1'
                data-fromright='1'
                root='./icons/settings_color_scheme.svg'
                onClick={() => invokeSettingsUI('color-scheme-setting')} />

            <div 
                className='grid-anchorable main-style setting-ui color-scheme-setting closed-s-ui'
                data-name='settingUI' data-fromtop='1' data-fromright='3' data-width='5'>
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

            <div className='grid-anchorable main-style side-content' data-name='sidePanel' data-fromtop='3' data-fromleft='1' data-width='8' data-height='18'>
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

            <div className='grid-anchorable main-style' data-name='mainContent' data-fromtop='3' data-fromright='12' data-width='9' data-height='18'></div>
            <div className='grid-anchorable main-style' data-name='mainContent' data-fromtop='3' data-fromleft='10' data-width='10' data-height='10'></div>
            <div className='grid-anchorable main-style' data-name='mainContent1' data-fromtop='3' data-fromright='1' data-width='10' data-height='7'></div>
            <div className='grid-anchorable main-style' data-name='mainContent3' data-frombottom='3' data-fromleft='10' data-width='10' data-height='7'></div>
            <div className='grid-anchorable main-style' data-name='mainContent4' data-frombottom='3' data-fromright='1' data-width='10' data-height='10'></div>
        </React.Fragment>
    )
}

export default App;
