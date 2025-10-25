export const helloSchema = {    
    response: {
        200: { type: "object", properties: { message: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const initSchema = {    
    response: {
        201: {
            type: "object",
            properties: { 
                id: { type: "integer" },
                bR: { type: "number" },
                pH: { type: "number" },
                pW: { type: "number" }
            },
            required: ["id", "bR", "pH", "pW"]            
        },
        429: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const startSchema = {
    params: {
			type: "object",
			properties: { id: { type: "integer" } },
			required: ["id"],
            additionalProperties: false
	},
    body: {
        type: "object",			
        properties: { startGame : { type: "boolean" } },
        required: ["startGame"],
        additionalProperties: false
    },		
    response: {
        200: { type: "object", properties: { message: { type: "string" } } },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const paddlesSchema = {
    params: {
			type: "object",
			properties: { id: { type: "integer" } },
			required: ["id"],
            additionalProperties: false
	},
    body: {
        type: "object",			
        properties: { p1: { type: "string" }, p2: { type: "string" } },
        required: ["p1", "p2"],
        additionalProperties: false
    },		
    response: {
        200: { 
            type: "object",
            properties: {
                success: { type: "boolean" },
                id: { type: "integer" },
            },
            required: ["success","id"]
        },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const stateSchema = { 
    params: {
			type: "object",
			properties: { id: { type: "integer" } },
			required: ["id"],
            additionalProperties: false
	},   
    response: {
        200: {
            type: "object",
            properties: {
                ball: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } }, required: ["x","y"] },
                paddle: { type: "object", properties: { p1: { type: "number" }, p2: { type: "number" } }, required: ["p1","p2"] },
                score: { type: "object", properties: { p1: { type: "integer" }, p2: { type: "integer" } }, required: ["p1","p2"] },
                winner: { type: "string" },
                pH: { type: "number" },
                wall: { type: "integer" }
            },
            required: ["ball","paddle","score","winner","pH","wall"]            
        },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const winnerSchema = {
    params: {
			type: "object",
			properties: { id: { type: "integer" } },
			required: ["id"],
            additionalProperties: false
	},   
    response: {
        200: {
            type: "object",
            properties: { winner: { type: "string" } },
            required: ["winner"]
        },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}
