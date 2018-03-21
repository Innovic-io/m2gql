/**
 * COPIED FROM objectid.js from bson
 * Machine id.
 *
 * Create a random 3-byte value (i.e. unique for this
 * process). Other drivers use a md5 of the machine id here, but
 * that would mean an asyc call to gethostname, so we don't bother.
 * @ignore
 */
const MACHINE_ID = parseInt(Math.random() * 0xffffff, 10);

// Regular expression that checks for hex value
const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

// Check if buffer exists
try {
    if (Buffer && Buffer.from) hasBufferType = true;
} catch (err) {
    hasBufferType = false;
}

/**
 * Create a new ObjectID instance
 *
 * @class
 * @param {(string|number)} id Can be a 24 byte hex string, 12 byte binary string or a Number.
 * @property {number} generationTime The generation time of this ObjectId instance
 * @return {ObjectID} instance of ObjectID.
 */
const ObjectID = function ObjectID(id) {
    // Duck-typing to support ObjectId from different npm packages
    if (id instanceof ObjectID) return id;
    if (!(this instanceof ObjectID)) return new ObjectID(id);

    // The most common usecase (blank id, new objectId instance)
    if (id == null || typeof id === 'number') {
        // Generate a new id
        this.id = this.generate(id);
        // If we are caching the hex string
        if (ObjectID.cacheHexString) this.__id = this.toString('hex');
        // Return the object
        return;
    }
    if (ObjectID.cacheHexString) this.__id = this.toString('hex');
};

// Allow usage of ObjectId as well as ObjectID
// const ObjectId = ObjectID;

// Precomputed hex table enables speedy hex string conversion
const hexTable = [];
for (let i = 0; i < 256; i++) {
    hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
}

/**
 * Return the ObjectID id as a 24 byte hex string representation
 *
 * @method
 * @return {string} return the 24 byte hex string representation.
 */
ObjectID.prototype.toHexString = function() {
    if (ObjectID.cacheHexString && this.__id) return this.__id;

    let hexString = '';
    if (!this.id || !this.id.length) {
        throw new Error(
            'invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [' +
            JSON.stringify(this.id) +
            ']'
        );
    }

    if (this.id instanceof _Buffer) {
        hexString = convertToHex(this.id);
        if (ObjectID.cacheHexString) this.__id = hexString;
        return hexString;
    }

    for (let i = 0; i < this.id.length; i++) {
        hexString += hexTable[this.id.charCodeAt(i)];
    }

    if (ObjectID.cacheHexString) this.__id = hexString;
    return hexString;
};

/**
 * Update the ObjectID index used in generating new ObjectID's on the driver
 *
 * @method
 * @return {number} returns next index value.
 * @ignore
 */
ObjectID.prototype.get_inc = function() {
    return (ObjectID.index = (ObjectID.index + 1) % 0xffffff);
};

/**
 * Generate a 12 byte id buffer used in ObjectID's
 *
 * @method
 * @param {number} [time] optional parameter allowing to pass in a second based timestamp.
 * @return {Buffer} return the 12 byte id buffer string.
 */
ObjectID.prototype.generate = function(time) {
    if ('number' !== typeof time) {
        time = ~~(Date.now() / 1000);
    }

    // Use pid
    const pid =
        (typeof process === 'undefined' || process.pid === 1
            ? Math.floor(Math.random() * 100000)
            : process.pid) % 0xffff;
    const inc = this.get_inc();
    // Buffer used
    const buffer = new Buffer(12);
    // Encode time
    buffer[3] = time & 0xff;
    buffer[2] = (time >> 8) & 0xff;
    buffer[1] = (time >> 16) & 0xff;
    buffer[0] = (time >> 24) & 0xff;
    // Encode machine
    buffer[6] = MACHINE_ID & 0xff;
    buffer[5] = (MACHINE_ID >> 8) & 0xff;
    buffer[4] = (MACHINE_ID >> 16) & 0xff;
    // Encode pid
    buffer[8] = pid & 0xff;
    buffer[7] = (pid >> 8) & 0xff;
    // Encode index
    buffer[11] = inc & 0xff;
    buffer[10] = (inc >> 8) & 0xff;
    buffer[9] = (inc >> 16) & 0xff;
    // Return the buffer
    return buffer;
};

/**
 * Converts the id into a 24 byte hex string for printing
 *
 * @param {String} format The Buffer toString format parameter.
 * @return {String} return the 24 byte hex string representation.
 * @ignore
 */
ObjectID.prototype.toString = function(format) {
    // Is the id a buffer then use the buffer toString method to return the format
    if (this.id && this.id.copy) {
        return this.id.toString(typeof format === 'string' ? format : 'hex');
    }

    // if(this.buffer )
    return this.toHexString();
};

/**
 * Compares the equality of this ObjectID with `otherID`.
 *
 * @method
 * @return {boolean} the result of comparing two ObjectID's
 * @param otherId ObjectID instance to compare against
 */
ObjectID.prototype.equals = function equals(otherId) {
    // const id;

    if (otherId instanceof ObjectID) {
        return this.toString() === otherId.toString();
    } else if (
        typeof otherId === 'string' &&
        ObjectID.isValid(otherId) &&
        otherId.length === 12 &&
        this.id instanceof _Buffer
    ) {
        return otherId === this.id.toString('binary');
    } else if (typeof otherId === 'string' && ObjectID.isValid(otherId) && otherId.length === 24) {
        return otherId.toLowerCase() === this.toHexString();
    } else if (typeof otherId === 'string' && ObjectID.isValid(otherId) && otherId.length === 12) {
        return otherId === this.id;
    } else if (otherId != null && (otherId instanceof ObjectID || otherId.toHexString)) {
        return otherId.toHexString() === this.toHexString();
    } else {
        return false;
    }
};

/**
 * @ignore
 */
ObjectID.index = ~~(Math.random() * 0xffffff);

const _Buffer = Buffer;
const convertToHex = function(bytes) {
    return bytes.toString('hex');
};

/**
 * Checks if a value is a valid bson ObjectId
 *
 * @method
 * @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
 */
ObjectID.isValid = function isValid(id) {
    if (id == null) return false;

    if (typeof id === 'number') {

        return true;
    }

    if (typeof id === 'string') {

        return id.length === 12 || (id.length === 24 && checkForHexRegExp.test(id));
    }

    if (id instanceof ObjectID) {

        return true;
    }

    return id instanceof _Buffer;


};

/**
 * Expose.
 */
module.exports = ObjectID;
module.exports.ObjectID = ObjectID;
module.exports.ObjectId = ObjectID;
