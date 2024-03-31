const DEFAULT_PAGE_LIMIT = 0 //All documents will be returned if limit is set to 0
const DEFAULT_PAGE_NUMBER = 1

function getPagination(query) { // TIS IS HOW TO ENABLE PAGINATION
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT

    const skip = (page - 1) * limit
    
    return {
        skip,
        limit,
    }
}

module.exports = getPagination