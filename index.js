'use strict';

const SearchUrl = 'https://developer.nps.gov/api/v1';
const endpoint = 'parks';
const maxResults = 50;
const defaultMinResults = 10;

const apiKey = 'IJBgwLw4zY7slLuialgTTRJdQFBTTlX2ZKJsoyE6';

function startForm(){
    BuildNumResultsOptions();
    //PopulateStates();

    $('form').submit(function(event){
        event.preventDefault();
       
        let statelist = ParseInput($('#search').val());
        if(statelist != null)
            Request(BuildQueryURL(statelist, $('#number-results :selected').val())); 
    });
}

function BuildNumResultsOptions() {
    let strArray = [];
    for(let i=0; i<maxResults; ++i)
        strArray.push(`<option value='${i+1}'>${i+1}</option>`);
        
    strArray[defaultMinResults-1] = `<option value='${defaultMinResults}' selected>${defaultMinResults}</option>`;

    $('#number-results').append(strArray.join(''));
}

function PopulateStates() {
    // populate states
    let strArray = [];

    'AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY'.split(',').forEach(function(item){
        strArray.push(`<option value='${item}'>${item}</option>`);
    });

    $('#state').append(strArray.join(''));
}

function ParseInput(inputText) {
    /*
    //A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]
    // http://regexlib.com/REDetails.aspx?regexp_id=471 */
    let regEx = new RegExp('\\b(?:[ALKSZRAEP]|[CAOT]|[DEC]|[FLM]|[GAU]|[HI|[IADLN]|[KSY]|[LA|[MADEHINOPST]|[NCDEHJMVY]|[OHKR]|[PARW]|[RI|[SCD]|[TNX]|[UT|[VAIT]|[WAIVY]){2}', 'g');
    let results = inputText.toUpperCase().match(regEx);
    return results.map(e => encodeURIComponent(e));
}

function BuildQueryURL(states, maxResults=defaultMinResults){

    const params = {
        api_key: apiKey        
        ,limit: maxResults
        //,q: query
        ,stateCode: (states.length>1) ? states.join(',') : states[0]
        ,start: 0
        ,fields: 'addresses'
        ,sort: 'stateCode,fullName'
    }
    let queryStr = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);

    return SearchUrl + `/${endpoint}` + '?' + queryStr.join('&');
}

function Request(url){
    console.log(url);

    fetch(url)
    .then(response => {
        if(response.ok)
            return response.json();
        throw new Error(response.statusText);
    })
    .then(responseJson => DisplayResult(responseJson))
    .catch(err => {
        console.log(`Something went wrong: ${err.message}`);
        $('#result-list').empty().append(`<li>${err.message}</li>`);
        $('section').removeClass('hidden');        
    })
}

function GetAddresLine(entry){
    if(entry.addresses.length < 2) return '';
    let addrPoint = entry.addresses[1];
    let loc = entry.latLong.split(/[:,]+/);
    let linkaddr = `https://www.google.com/maps/search/?api=1&query=${loc[1]},${loc[3]}`;
    return `<p><a class='gladr' href='${linkaddr}' target='_blank'>${addrPoint.line1}<br>${addrPoint.line2} ${addrPoint.city}, ${addrPoint.stateCode} ${addrPoint.postalCode}</a></p>`;
}

function DisplayResult(response){
    //console.log(response); 
    let resultEntries = [];

    response.data.forEach(function(item){
        resultEntries.push(
            `<li><div><p class='repoTitle'>${item.fullName}</p>
            ${GetAddresLine(item)}\
            <p>States: ${item.states}</p>\
            <p><a href='${item.url}' target='_blank'>${item.url}</a></p></div>\                        
            <div>${item.description}</div>\
            </li>`);
    });
    $('#result-list').empty().append(resultEntries.join(''));
    $('section').removeClass('hidden');
}

$(startForm);