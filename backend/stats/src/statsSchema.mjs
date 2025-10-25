export const insertSchema = {
    body: {
        type: "object",			
        properties: {
            gameid : { type: "integer" },
            userid1 : { type: "integer" },
            userid2 : { type: "integer" },				
            player1: { type: "string" },
            player2: { type: "string" },
            winner: { type: "string" },
            winnerid: { type: "integer" },
            score1 : { type: "integer" },
            score2 : { type: "integer" },
            maxtouch : { type: "integer" },
            speedy : { type: "boolean" },
            paddy : { type: "boolean" },
            wally : { type: "boolean" },
            mirry : { type: "boolean" },
            multy : { type: "boolean" }
        },
        required: ["gameid", "userid1", "userid2", "player1", "player2", "winner", "winnerid", "score1", "score2", "maxtouch", "speedy", "paddy", "wally", "mirry", "multy"],
        additionalProperties: false
    },		
    response: {
        201: {
            type: "object",
            properties: { message: { type: "string" } },
            required: ["message"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }	
}

export const deleteSchema = {		
    response: {
        200: {
            type: "object",
            properties: { message: { type: "string" } },
            required: ["message"],
            additionalProperties: false
        },
        400: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }	
}

export const amendSchema = {
    params: {
			type: "object",
			properties: { userid: { type: "integer" } },
			required: ["userid"],
            additionalProperties: false
	},
    body: {
        type: "object",			
        properties: { newAlias : { type: "string" } },
        required: ["newAlias"],
        additionalProperties: false
    },		
    response: {
        200: { type: "object", properties: { message: { type: "string" } } },        
        500: { type: "object", properties: { error: { type: "string" } } }
    }	
}

export const pieSchema = {    
    response: {
        200: {
            type: "object",
            properties: {
                labels: { type: "array", items: { type: "string" } },
                values: { type: "array", items: { type: "integer" } }
            },
            required: ["labels", "values"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const barSchema = {    
    response: {
        200: {
            type: "object",
            properties: {
                player: { type: "array", items: { type: "string" } },                
                nbWin: { type: "array", items: { type: "integer" } },
                point: { type: "array", items: { type: "integer" } },
                nbMatch: { type: "array", items: { type: "integer" } }                
            },
            required: ["player", "nbWin", "point", "nbMatch"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const scatterSchema = {    
    response: {
        200: {
            type: "array",
            itels: {
                type: "object",
                properties: {
                    x: { type: "integer" },
                    y: { type: "integer" } 
                },            
                additionalProperties: false
            }
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const userdataSchema = {
    params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
        additionalProperties: false
	},    
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    userid: { type: "integer" },
                    diff: { type: "integer" },
                    maxtouch: { type: "integer" },
                    speedy:  { type: "boolean" },
                    paddy:  { type: "boolean" },
                    wally:  { type: "boolean" },
                    mirry:  { type: "boolean" },
                    multy:  { type: "boolean" },
                    nbMatch: { type: "integer" },
                    nbWin: { type: "integer" },
                    rank: { type: "integer" } 
                },            
                additionalProperties: false
            }
        },
        401: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const userpieSchema = {
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
                labels: { type: "array", items: { type: "string" } },
                values: { type: "array", items: { type: "integer" } }
            },
            required: ["labels", "values"],
            additionalProperties: false
        },
        401: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const userlineSchema = {
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
                row: { type: "array", items: { type: "integer" } },
                maxtouch: { type: "array", items: { type: "integer" } }
            },
            required: ["row", "maxtouch"],
            additionalProperties: false
        },
        401: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const userwinSchema = {
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
                row: { type: "array", items: { type: "integer" } },
                win: { type: "array", items: { type: "integer" } }
            },
            required: ["row", "win"],
            additionalProperties: false
        },
        401: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};

export const usertableSchema = {
    params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
        additionalProperties: false
	},
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    gameid: { type: "integer" },
                    userid1: { type: "integer" },
                    userid2: { type: "integer" },
                    player1: { type: "string" },
                    player2: { type: "string" },
                    winner: { type: "string" },
                    winnerid: { type: "integer" },
                    score1: { type: "integer" },
                    score2: { type: "integer" },
                    maxtouch: { type: "integer" },
                    speedy:  { type: "boolean" },
                    paddy:  { type: "boolean" },
                    wally:  { type: "boolean" },
                    mirry:  { type: "boolean" },
                    multy:  { type: "boolean" },                
                    created_at: { type: "string", format: "date-time" }
                },
                additionalProperties: false
            }
        },
        401: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        },
        500: {
            type: "object",
            properties: { error: { type: "string" } },
            required: ["error"],
            additionalProperties: false
        }
    }
};
