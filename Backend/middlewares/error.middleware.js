// Custom Express error handling middleware for better error messages
const errorMiddleware = (err, req, res, next) => {
    try {
        //Clone the original error to avoid modifying it directly 
        let error = { ...err };

        // preserve the original message
        error.message = err.message;

        //log the new err for debugging in the terminal
        console.log(err);

        //handle invalid MongoDB object (e.g., malformed _id in URL)
        if(err.name === 'CateError') {
            const message = 'Resource not found';
            error.statusCode = 404;
        }

        //Handle MongoDB duplicate key error(eg.- unique email conflict)

        if(err.code === 11000) {
            error.message = 'Duplicate field value entered';
            error.statusCode = 400;
        }

        //Handle MongoDB validation err (eg.- required field missing, invalid format)

        if(err.name === 'validationError') {
            // collect all validation message from Mongoose error object
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400;
        }

        //Send JSON response with appropriate status and error message
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error',
        })


    } catch (error) {
        //Pass any unexpected error to the default Express error handler
        next(error);
    }
}

export default errorMiddleware;