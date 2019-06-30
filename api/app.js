const express = require('express');
const app = express();

require('./db/mongoose'); // we need to require this file to connect to our database

const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');

const { Contact, User } = require('./db/models');

/* MIDDLEWARE */
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 2500);
// })


// CORS MIDDLEWARE
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, _id, x-access-token, x-refresh-token');

    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
    
    next();
})

// check whether the request has a valid JWT access token
const authenticate = (req, res, next) => {
    // grab the access token from the request header
    const accessToken = req.header('x-access-token');

    // verify the JWT
    jwt.verify(accessToken, User.getJWTSecret(), (error, decoded) => {
        if (error) {
            // there was an error
            // jwt is invalid - DO NOT AUTHENTICATE
            res.status(401).send({error});
        } else {
            // JWT is valid
            req.userId = decoded._id;
            next();
        }
    })
}



// Verify Refresh Token middleware (which will be verifying the session)
const verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    const refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    const _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

        // if the code reaches here - ther user was found
        // therefore the refresh token exists in the database
        // but we still have to check whether or not it has expired or not

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        })

        if (isSessionValid) {
            // the session is VALID

            // set properties on the request object
            req.userId = user._id;
            req.userObj = user;
            req.refreshToken = refreshToken;
            
            // call next() to continue processing this request
            next();
        } else {
            // the session is NOT valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
}




/* ROUTES */

/**
 * GET /contacts
 * Purpose: Get all contacts
 */
app.get('/contacts', authenticate, (req, res) => {
    Contact.find({
        _userId: req.userId
    }).then((contacts) => {
        res.send(contacts);
    })
})

/**
 * POST /contacts
 * Purpose: Create a new contact
 */
app.post('/contacts', authenticate, (req, res) => {
    // We want to create a new contact and return the contact object (which will include the contact _id)
    let contactInfo = req.body;
    contactInfo._userId = req.userId;

    let newContact = new Contact(contactInfo);
    newContact.save().then((contactDoc) => {
        // the full contact document (incl. _id) is passed to this callback
        res.send(contactDoc);
    }).catch(e => {
        res.status(400).send(e);
    })
})

/**
 * PATCH /contacts/:id
 * Purpose: Update a contact
 */
app.patch('/contacts/:id', authenticate, (req, res) => {
    // We want to update the specified contact (contact document with id in the URL)
    // with the new values specified in the JSON body of the request
    Contact.findOneAndUpdate({
        _id: req.params.id,
        _userId: req.userId
    }, {
        $set: req.body
    }).then(() => {
        res.status(200).send();
    })
})

/**
 * DELETE /contacts/:id
 * Purpose: Delete a contact
 */
app.delete('/contacts/:id', authenticate, (req, res) => {
    Contact.findOneAndRemove({
        _id: req.params.id,
        _userId: req.userId
    }).then((removedContactDoc) => {
        res.send(removedContactDoc);
    })
})


/**
 * DELETE /users/session
 * Purpose: Logout (Delete a session from the database)
 */
app.delete('/users/session', verifySession, (req, res) => {
    let userId = req.userId;
    let refreshToken = req.refreshToken; // this is the token we have to invalidate
    User.findOneAndUpdate({
        _id: userId
    }, {
        $pull: {
            sessions: {
                token: refreshToken
            }
        }
    }).then(() => {
        console.log("REMOVED SESSION");
        res.send();
    })
})


/* USER ROUTES */


/**
 * POST /users
 * Purpose: create a new user
 */
app.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session has been created successfully
        // and the refresh token has been returned

        // now we generate an access token for the user
        return newUser.generateAccessToken().then((accessToken) => {
            // access token generated successfully
            // now return an object that contains both auth tokens
            return { accessToken, refreshToken }
        })
    }).then((authTokens) => {
        // construct and send the response
        // with auth tokens in header, and user obj in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})




/**
 * POST /users/login
 * Purpose: Login a user
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session has been created successfully
            // and the Refresh Token has been returned (as a callback argument)

            return user.generateAccessToken().then((accessToken) => {
                // access token has been generated successfully
                // so now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            })
        }).then((authTokens) => {
            // now we construct and send the response to the user with their auth tokens
            // in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    })
})



/**
 * GET /users/me/access-token
 * Purpose: generate and return a fresh access token (JWT)
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated (because of the verifySession middleware)
    // and we have the userId and user object available to us
    req.userObj.generateAccessToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    })
})


/**
 * PATCH /users/:id
 * Purpose: update details of a user
 */
app.patch('/users/:id', authenticate, (req, res) => {
    let body = req.body;
    delete body.sessions;

    console.log(body);
    
    // User.findOneAndUpdate({
    //     _id: req.params.id
    // }, {
    //     $set: body
    // }).then(() => {
    //     res.status(200).send();
    // })

    User.findOne({
        _id: req.userId
    }).then((userDoc) => {
        Object.assign(userDoc, body);
        userDoc.save().then(() => {
            res.status(200).send();
        })
    })
})




app.listen(3000, () => {
    console.log("API is running on port 3000");
})