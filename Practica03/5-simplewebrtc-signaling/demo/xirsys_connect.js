// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
/*var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		channel : 'dsmroom',
		ident : 'cmartinezdemorentin',
		secret : '1d9198ec-fa7a-11e6-b3ff-8ea033d8fb4d'
	}
};*/

var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		domain : 'www.britxi.com',
		application : 'default',
		room : 'default',
		ident : 'cmartinezdemorentin',
		secret : '1d9198ec-fa7a-11e6-b3ff-8ea033d8fb4d',
		secure : 0
	}
};

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
