import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
function getURL (options) {
    //The /records endpoint accepts the following options, sent as query string parameters on the request URL
    const endPoint = URI(window.path)

    //set limit
    endPoint.addSearch("limit", 11)
    if (!options) return endPoint

    //set offset
    const offset = ((!options.page ? 1 : options.page) - 1) * 10
    endPoint.addSearch("offset", offset)

    //set colors
    if (options.colors) options.colors.map(x => endPoint.addSearch("color[]", x))

    return endPoint.normalize()
}
function getData(ret,endPoint) {
    //requests data from the /records endpoint 
   return fetch(endPoint).then(function (res) {
        if(res.status == 200)  return res.json();
        else console.log("Error")
    })
    //Upon a successful API response, transform the fetched payload into an object containing the following keys
    //{ids:[],open:[],closedPrimaryCount:0,previousPage:1,nextPage:2,}
    .then(function (data) {
        let ids
        let lastPage = true;
        data.forEach(function (e, i) {
            if (i == 10) {lastPage = false; return}

            ret.ids.push(e.id)
            e.isPrimary = e.color == 'red' || e.color == 'blue' || e.color == 'yellow' ? true : false
            e.isPrimary ? e.disposition == 'closed' ? ret.closedPrimaryCount++ : {} : {}
            e.disposition == "open" ? ret.open.push(e) : {}
        })
        if (lastPage) ret.nextPage = null
        return ret
        })
        .catch(function (err) {
            console.log("Error Occured:",err)
        })
}
function retrieve(options) {
    const endPoint = getURL(options)
    let optionsPage = !options || !options.page ? 1 : options.page;
    //response object
    const response = {
        previousPage: optionsPage == 1 ? null : optionsPage - 1,
        nextPage: optionsPage + 1,
        ids: [],
        open: [],
        closedPrimaryCount: 0
    }
    const prom = getData(response,endPoint)
    return prom
}
export default retrieve;