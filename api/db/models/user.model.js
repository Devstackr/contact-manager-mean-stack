const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const crypto = require('crypto');

const jwtSecret = '7eh5j4VVG1skljadfpkdwarcskyyzzcbiukkvkczckusddxaklkjsldkykSVXNaQle';

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }, 
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
})


/* INSTANCE METHODS */

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // return the document except the password and sessions
    // as these shouldn't be made available
    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JSON Web Token and return it
        jwt.sign({ _id: user._id }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                // there is an error
                reject();
            }
        })
    })
}

UserSchema.methods.generateRefreshToken = function() {
    // this method returns a 64byte hex string
    // this is all it does. it wont save it to the database
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    });
}

UserSchema.methods.createSession = function() {
    const user = this;

    return user.generateRefreshToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        // saved to database successfully
        // now return the refresh token
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    })
}

/* MODEL METHODS */
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    // finds user by id and token
    // this will be used in authentication middleware

    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    return User.findOne({ email }).then((user) => {
        // check whether user has been found
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    // the comparison was successful - so password is correct
                    resolve(user);
                } else {
                    // the comparison was not successful
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired
        return false;
    } else {
        // has expired
        return true;
    }
}


/* MIDDLEWARE */
UserSchema.pre('save', function(next) {
    const user = this;
    const costFactor = 10;

    if (user.isModified('password')) {
        // the password field has been edited/changed

        // Generate the salt and hash the plaintext password
        bcrypt.genSalt(costFactor, (err, salt) => {
            // salt has been generated - now we just have to hash the password
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})




/* HELPER METHODS */
let saveSessionToDatabase = (user, refreshToken) => {
    // Save the session to the database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();
        
        user.sessions.push({
            'token': refreshToken,
            expiresAt
        })

        user.save().then(() => {
            // session was successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = 10;
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}




const User = mongoose.model('User', UserSchema);

module.exports = { User }