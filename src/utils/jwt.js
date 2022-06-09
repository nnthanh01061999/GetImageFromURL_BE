const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const promisify = require('util').promisify;

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);

const generateToken =async (payload, secretSignature, tokenLife) => {
    try{
       return  await sign({
           ...payload
       },
        secretSignature,
        {
            algorithm: 'HS256',
            expiresIn: tokenLife,
        })
    } catch (error) {
		console.log(`Error in generate access token:  + ${error}`);
		return null;
	}
}

const generateRefreshToken = () =>{
    return randToken.generate(process.env.REFRESH_TOKEN_SIZE);
}

module.exports = {
    sign,
    verify,
    generateToken,
    generateRefreshToken,
}