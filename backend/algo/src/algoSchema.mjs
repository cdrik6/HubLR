export const coefSchema = {    
    response: {
        200: {            
            type: "object",
            properties: {                
                m: { type: "number" },
                p: { type: "number" }                
            },
            required: ["m", "p"],
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

export const qualitySchema = {    
    response: {
        200: {            
            type: "object",
            properties: {                
                mse: { type: "number" },
                rmse: { type: "number" },
                r2: { type: "number" }
            },
            required: ["mse", "rmse", "r2"],
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