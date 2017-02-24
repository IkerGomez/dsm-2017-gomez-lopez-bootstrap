// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		channel : 'channel1',
		ident : 'cmartinezdemorentin',
		secret : '073c7a42-fa81-11e6-9bd6-ff4ec1b2c046'
	}
};

/*var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		domain : 'www.britxi.com',
		application : 'default',
		room : 'default',
		ident : 'cmartinezdemorentin',
		secret : '1d9198ec-fa7a-11e6-b3ff-8ea033d8fb4d',
		secure : 0
	}
};*/

// Secure method
/*var xirsysConnect = {
	secureTokenRetrieval : true,
	server : '../getToken.php',
	data : {
		domain : '< www.yourdomain.com >',
		application : 'default',
		room : 'default',
		secure : 1
	}
};*/
