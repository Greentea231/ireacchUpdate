(function(){
  'use strict';

  if(window.WS5Logger) return;

  const LOG_KEY = 'ws5PrototypeEventLogs';
  const SESSION_KEY = 'ws5AnonymousSessionId';
  const MAX_EVENTS = 1000;
  const pageViews = new Set();

  const EVENT_NAMES = {
    '0.1':'Login page viewed',
    '0.2':'Mock login completed',
    '0.3':'Logout selected',
    '1.0':'Micro-surveys page viewed',
    '1.1':'Survey link selected',
    '1.2':'Micro-survey information area opened',
    '1.3':'Micro-survey navigation control selected',
    '2.0':'Reflection Space page viewed',
    '2.1':'Reflection field focused',
    '2.2':'Optional details opened',
    '2.3':'Theme selected',
    '2.4':'Intensity selected',
    '2.5':'Confidence selected',
    '2.6':'Reflection submitted',
    '3.0':'Best Practices page viewed',
    '3.1':'Search performed',
    '3.2':'Filter selected',
    '3.3':'Practice card opened',
    '3.4':'Vote selected',
    '3.5':'Contribution form opened',
    '3.6':'Contribution submitted',
    '4.0':'Dashboard page viewed',
    '4.1':'Dashboard filter changed',
    '4.2':'Comparison control used',
    '4.3':'Methods and definitions opened',
    '4.4':'Excel export selected',
    '4.5':'Copy to Word selected',
    '4.6':'Reload data selected',
    '4.7':'Dashboard question detail opened',
    '4.8':'Dashboard overview returned to',
    '4.9':'Dashboard qualitative detail opened',
    '4.10':'Dashboard full question list opened',
    '5.1':'Home navigation selected',
    '5.2':'Toolkit section navigation selected'
  };

  const SAFE_METADATA_KEYS = new Set([
    'destinationPage',
    'filterCategory',
    'filterType',
    'control',
    'section',
    'exportType',
    'surveyId',
    'selected',
    'state',
    'pageArea',
    'cardId',
    'voteType'
  ]);

  const currentPage = () => {
    const last = (location.pathname || '').split('/').filter(Boolean).pop();
    return last || 'index.html';
  };

  function makeSessionId(){
    if(window.crypto && crypto.getRandomValues){
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return 'anon-' + Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
    }
    return 'anon-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  function getSessionId(){
    try{
      let id = sessionStorage.getItem(SESSION_KEY);
      if(!id){
        id = makeSessionId();
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    }catch{
      return makeSessionId();
    }
  }

  function getUserId(){
    // This toolkit currently has no authentication or mock-login state.
    // Replace the return value in this one function when an authenticated
    // University identifier becomes available.
    return 'Unknown User';
  }

  function beginNewSession(){
    const id = makeSessionId();
    try{ sessionStorage.setItem(SESSION_KEY, id); }catch{}
    return id;
  }

  function readLogs(){
    try{
      const parsed = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    }catch{
      return [];
    }
  }

  function writeLogs(logs){
    try{
      const capped = logs.slice(Math.max(0, logs.length - MAX_EVENTS));
      localStorage.setItem(LOG_KEY, JSON.stringify(capped));
      return true;
    }catch{
      return false;
    }
  }

  function safeMetadata(metadata){
    const out = {};
    if(!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return out;
    Object.keys(metadata).forEach(key => {
      if(!SAFE_METADATA_KEYS.has(key)) return;
      const value = metadata[key];
      if(value === null || value === undefined) return;
      if(['string','number','boolean'].includes(typeof value)){
        out[key] = String(value).slice(0, 120);
      }
    });
    return out;
  }

  function log(eventCode, eventName, metadata){
    try{
      const code = String(eventCode || '');
      const entry = {
        userId: getUserId(),
        sessionId: getSessionId(),
        eventCode: code,
        eventName: eventName || EVENT_NAMES[code] || 'Toolkit interaction',
        page: currentPage(),
        timestamp: new Date().toISOString(),
        metadata: safeMetadata(metadata)
      };
      const logs = readLogs();
      logs.push(entry);
      writeLogs(logs);
      return entry;
    }catch{
      return null;
    }
  }

  function logPageView(eventCode, eventName){
    const key = currentPage() + ':' + eventCode;
    if(pageViews.has(key)) return null;
    pageViews.add(key);
    return log(eventCode, eventName);
  }

  function clearLogs(){
    try{ localStorage.removeItem(LOG_KEY); return true; }
    catch{ return false; }
  }

  function installNavigationLogging(){
    document.addEventListener('click', event => {
      const link = event.target.closest && event.target.closest('a[href]');
      if(!link) return;
      let url;
      try{ url = new URL(link.getAttribute('href'), location.href); }
      catch{ return; }
      if(url.origin !== location.origin) return;
      const page = (url.pathname || '').split('/').filter(Boolean).pop() || 'index.html';
      if(page === 'logging-test.html') return;
      if(page === 'index.html'){
        log('5.1', EVENT_NAMES['5.1'], { destinationPage: page });
        return;
      }
      if(['micro-surveys.html','reflection.html','best-practices.html','dashboard.html','survey.html'].includes(page)){
        log('5.2', EVENT_NAMES['5.2'], { destinationPage: page });
      }
    }, true);
  }

  window.WS5Logger = {
    log,
    logPageView,
    getUserId,
    getSessionId,
    beginNewSession,
    readLogs,
    clearLogs,
    storageKey: LOG_KEY,
    maxEvents: MAX_EVENTS,
    eventNames: Object.freeze({...EVENT_NAMES})
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', installNavigationLogging, { once:true });
  }else{
    installNavigationLogging();
  }
})();
