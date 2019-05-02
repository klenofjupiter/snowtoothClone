const { ApolloServer, gql } = require("apollo-server");
const lifts = require("./data/lifts.json");
const trails = require("./data/trails.json");

// we need two things now. a schema, and resolvers.
//what's a resolver? 
//the thing that fulfills the promise made by the schema
//but first, our server 

//this typeDef tells us what promise we need to fulfill
//eg that a query to hello must return a string

//for when your type defs come from another file: 
// const typeDefs = fs.readFileSync("typeDefs.graphql", "UTF-8");

const typeDefs = gql`
	type Lift {
		id: ID!
		name: String!
		status: LiftStatus
		capacity: Int!
		night: Boolean
		elevationGain: Int!
		trailAccess: [Trail]
	}
	type Trail {
		id: ID!
		name: String!
		lift: [String!]!
		difficulty: Difficulty!
		status: TrailStatus!
		groomed: Boolean
		snowmaking: Boolean
		trees: Boolean
		night: Boolean
		accessedByLifts: [Lift!]!
	}

	enum Difficulty {
		beginner
		intermediate
		advanced
		expert
	}
	enum LiftStatus {
		OPEN
		CLOSED
		HOLD
	}
	enum TrailStatus {
		OPEN 
		CLOSED
	}
	type Query {
		hello: String!
		LiftCount(status: LiftStatus): Int!
		allLifts: [Lift!]!
		findLiftById(id: ID!): Lift!
		allTrails(status: TrailStatus): [Trail!]!
		findTrailByID(id: ID!): Trail!
		trailCount(status: TrailStatus!): Int!
	}
`
//this resolver tells us how to do 
//like, when you get the query hello, it returns the string hello world
const resolvers = {
	Query: {
		// hello: () => "Hello World"
		allLifts: () => lifts,
		LiftCount: (parent, { status }) => {
			if(!status){
			   return	lifts.length
			}else {
				return lifts.filter(lift => lift.status === status).length
			}
			
		},
		//what is the parent? --> what object is one level up? we're not gonna use it here, but we will use it later (right now we just to put it in because it's the first positional argument).
		//the "args" come from the query --> they're an object with all the args as key/value pairs
		//args can also be destructured { id, name }  gives you args.id and args.name aliased to "id" and "name"
		findLiftById: (parent, args) =>  {
			return lifts.find(lift => args.id === lift.id)
		},
		allTrails: (parent,  { status }) => {
			if(!status){
				return trails.length
			}else{
				return trails.filter( trail => trail.status === status)
			}
		},
		trailCount: (parent, { status }) => {
			return trails.filter( trail => trail.status === status).length
		}, 
		findTrailByID: (parent, { id }) => trails.find(trail => trail.id === id), 

	},
	Lift: {
			trailAccess: parent => parent.trails.map(id => trails.find(t => id === t.id)).filter(x => x)
	}
}
const server = new ApolloServer({
	typeDefs, 
	resolvers
})

server.listen().then(() => console.log("hey all you cool cats out there, server is running on port 4000..."))