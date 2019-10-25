const express = require("express");
const bodyparser = require("body-parser");
const crypto = require('crypto');
const cryptoJSON = require('crypto-json');

const app = express();

app.use(bodyparser());


const port=process.env.PORT || 3000
app.listen(port,function()
{
	console.log("listen to port 3000");
});


function encrypt(data,key)
{
	let genKey = crypto.createCipher('aes-128-cbc', key);
	let encryptedData = genKey.update(JSON.stringify(data), 'utf8', 'hex')
	encryptedData += genKey.final('hex');
	return encryptedData;
}

app.post("/encrypt",function(req,res)
{
	var obj = req.body;
	var requestobj = obj.Request;
	var key1 = requestobj.Key1;
	var key2 = requestobj.Key2;

	if(requestobj.Key1 != "" && requestobj.Key2 != "")
	{
		obj.Header = encrypt(obj.Header,requestobj.Key1);
		obj.Body = encrypt(obj.Body,requestobj.Key2);
		res.json(obj);
	}
	else if(requestobj.Key1 != "")
	{
		obj.Header = encrypt(obj.Header,requestobj.Key1);
		res.json(obj);
	}
	else if(requestobj.Key2 != "")
	{
		obj.Body = encrypt(obj.Body,requestobj.Key2);
		res.json(obj);
	}
	else
	{
		res.send("Please Enter Keys");
	}
})


function decrypt(data,key)
{	
	return new Promise((resolve,reject) => {
		try
		{
			let genKey = crypto.createDecipher('aes-128-cbc', key);
			let decryptedData = genKey.update(data, 'hex', 'utf8')
			decryptedData += genKey.final('utf8');
			resolve(JSON.parse(decryptedData));
		 }
		catch(err)
		{
			console.log("error caught");
			reject("Wrong Key");
		}
	})
}

app.post("/decrypt",function(req,res)
{
	var obj = req.body;
	var requestobj = obj.Request;
	var key1 = requestobj.Key1;
	var key2 = requestobj.Key2;

	if(requestobj.Key1 != "" && requestobj.Key2 != "")
	{

		decrypt(obj.Header,requestobj.Key1).then((data) => {
			obj.Header = data;
			decrypt(obj.Body,requestobj.Key2).then((data) => {
				obj.Body = data;	
				res.json(obj);
			})
			.catch((msg) => {
				res.send(msg);	
			})			
		})
		.catch((msg) => {
			res.send(msg);
		})		
	}
	else if(requestobj.Key1 != "")
	{
		
		decrypt(obj.Header,requestobj.Key1,res).then((data) => {
			obj.Header = data;
			res.json(obj);
		})
		.catch((msg) => {
			res.send(msg);
		})		
	}
	else if(requestobj.Key2 != "")
	{
		decrypt(obj.Body,requestobj.Key2,res).then((data) => {
			obj.Body = data;
			res.json(obj);
		})
		.catch((msg) => {
			res.send(msg);
		});
	}
	else
	{
		res.send("No Key specified");
	}
});

