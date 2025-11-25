export const insertSchema = {
    body: {
        type: "object",			
        properties: {
            km : { type: "integer" },
            price : { type: "integer" }            
        },
        required: ["km", "price"],
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

export const barSchema = {    
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    label: { type: "string" },
                    nb: { type: "integer" }
                },
                required: ["label", "nb"],
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

export const scatterSchema = {    
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    x: { type: "integer" },
                    y: { type: "integer" } 
                },
                required: ["x", "y"],
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

export const normSchema = {    
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    x: { type: "number" },
                    y: { type: "number" } 
                },
                required: ["x", "y"],
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

export const regSchema = {    
    response: {
        200: {
            type: "object",
            properties: {
                datapoints: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            x: { type: "number" },
                            y: { type: "number" } 
                        },
                        required: ["x", "y"],    
                        additionalProperties: false
                    }                    
                },
                dataline: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            x: { type: "number" },
                            y: { type: "number" } 
                        },
                        required: ["x", "y"],    
                        additionalProperties: false    
                    }                    
                }
            },
            required: ["datapoints", "dataline"],
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

// { m: m, p: p, mse: MSE, rmse: RMSE, r2: R2}
export const qualitySchema = {    
    response: {
        200: {            
            type: "object",
            properties: {
                m: { type: "number" },
                p: { type: "number" },
                mse: { type: "number" },
                rmse: { type: "number" },
                r2: { type: "number" }
            },
            required: ["m", "p", "mse", "rmse", "r2"],
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