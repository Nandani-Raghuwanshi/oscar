const { ObjectId } = require('mongodb');

function toObjectId(id) {
    try {
        return new ObjectId(id);
    } catch (err) {
        return id;
    }
}

module.exports = { toObjectId };
