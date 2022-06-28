// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');
//import authentication error from ApolloServer
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    // get a single user by either their id or their username
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                .select('-__v -password')
                return userData
            }
            throw new AuthenticationError('BEEPBOOP Cannot find a user with this id!')
        } 
    },
    Mutation: {
        // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
        // {body} is destructured req.body
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })
            if (!user) {
                throw new AuthenticationError('BEEPBOOP can"t find this user')
            }
            const noTypos = await user.isCorrectPassword(password)
            if (!noTypos) {
                throw new AuthenticationError('BEEPBOOP thats the wrong password')
            }
            const token = signToken(user)
            return { token, user }
        },
        // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
        addUser : async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token, user }
        },
        // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
        // user comes from `req.user` created in the auth middleware function
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedLibrary = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true }
                )
                return updatedLibrary
            }
            throw new AuthenticationError('BEEPBOOP make sure you"re logged in first')
        },
        // remove a book from `savedBooks`
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedLibrary = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId }},
                    { new: true }
                )
                return updatedLibrary
            }
            throw new AuthenticationError('BEEPBOOP make sure you"re logged in first')
        }
    }
}
module.exports = resolvers;